var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var http = require('http');
var socketIo = require('socket.io');
var cors = require('cors');
var FormData = require('form-data');
var multer = require('multer');
var axios = require('axios');


var imageRouter = require('./routes/image');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tablesRouter = require('./routes/tables');
var menusRouter = require('./routes/menu');
var addonRouter = require('./routes/addon');
var presetRouter = require('./routes/preset');
var cartRouter = require('./routes/cart');
var reserveRouter = require('./routes/reservation');
var chatRoutes = require('./routes/chat');
var restaurantsRouter = require('./routes/restaurants');
var paymentRouter = require('./routes/payment');
var promotionRouter = require('./routes/promotion');
var helpCenterRouter = require('./routes/helpCenter');



const Chat = require('./models/chat');
const Reservation = require('./models/reservation');
var app = express();

var server = http.createServer(app);
var io = socketIo(server, {
    cors: {
        origin: "*", // Adjust this as per your requirement
        methods: ["GET", "POST"]
    }
});

// view engine setup
app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use((req, res, next) => {
    req.io = io;
    next();
});
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tables', tablesRouter);
app.use('/restaurants', restaurantsRouter);
app.use('/image', imageRouter);
app.use('/menus', menusRouter);
app.use('/addons', addonRouter);
app.use('/cart', cartRouter);
app.use('/reservation', reserveRouter);
app.use('/chat', chatRoutes);
app.use('/preset', presetRouter);
app.use('/payment', paymentRouter);
app.use('/promotion', promotionRouter);
app.use('/helpCenter', helpCenterRouter);




app.set('socketio', io);
const connectedUsers = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinRoom', async (roomId, userType) => {
        socket.join(roomId);
        console.log('Joined room:', roomId);
        console.log('user Joined room:', userType);
        connectedUsers[socket.id] = { roomId, userType };
        try {
            let chat = await Chat.findOne({ reservation: roomId });
            if (!chat) {
                console.error('Chat not found');
                return;
            }

            chat.messages.forEach(message => {
                if ((userType === 'customer' && message.sender === 'restaurant') ||
                    (userType === 'restaurant' && message.sender === 'customer')) {
                    if (message.readStatus === "notRead") {
                        message.readStatus = "ReadIt";
                    }
                }
            });

            await chat.save();
            io.to(roomId).emit('updateMessages', chat.messages);

        } catch (error) {
            console.error('Error updating message readStatus:', error);
        }
    });



    socket.on('chatMessage', async (data) => {
        console.log('Received chatMessage:', data);
        try {
            let chat = await Chat.findOne({ reservation: data.reservationID })
                .populate('restaurant', 'restaurantName restaurantIcon')
            if (!chat) {
                console.error('Chat not found');
                return;
            }

            const newMessage = {
                sender: data.sender,
                message: data.message,
                timestamp: new Date(),
                readStatus: 'notRead'
            };


            for (const socketId in connectedUsers) {
                if (connectedUsers[socketId].roomId === data.reservationID) {
                    if ((connectedUsers[socketId].userType === 'customer' && data.sender === 'restaurant') ||
                        (connectedUsers[socketId].userType === 'restaurant' && data.sender === 'customer')) {
                        newMessage.readStatus = 'ReadIt';
                    }
                }
            }

            chat.messages.push(newMessage);
            await chat.save();

            io.to(data.reservationID).emit('message', newMessage);
            const senderRestaurant = data.sender == 'restaurant'
            if (senderRestaurant) {
                console.log(chat.restaurant)
                socket.broadcast.emit('notification', {
                    restaurant: chat.restaurant.restaurantName,
                    restaurantID: chat.restaurant.id,
                    message: data.message,
                    reservationID: data.reservationID,
                });
            }


        } catch (error) {
            console.error('Error saving message to database:', error);
        }
    });

    socket.on('updateLocation', async (data) => {
        const { reservationID, location } = data;
        console.log('Received location:', location);
        try {
            const reservation = await Reservation.findById(reservationID);
            if (reservation) {
                reservation.locationCustomer = location;
                await reservation.save();
                console.log('Location updated:', location);


                io.to(reservationID).emit('locationUpdated', {
                    reservationID,
                    location,
                });
            }
        } catch (error) {
            console.error('Error updating location:', error);
        }
    });

    socket.on('uploadSlip', async (data) => {
        try {
            const { fileBuffer, fileName, totalP, username } = data;
            console.log(username)
            const reservation = await Reservation.findOne({ username }).exec();
            if (!reservation) {
                throw new Error('Reservation not found');
            }

            const reservationId = reservation._id;
            console.log('Found Reservation ID:', reservationId);
            const formData = new FormData();
            formData.append('files', Buffer.from(fileBuffer), fileName);
            const response = await axios.post('https://api.slipok.com/api/line/apikey/37351', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'x-authorization': 'SLIPOKEK1O7VQ',
                },
            });
            const payments = response.data;
            console.log('SlipOK Response:', payments);
            const { transRef, transTime, transDate, sender, receiver, amount } = response.data.data;
            if (receiver && receiver.name === 'MR. TAKACHI Y') {
                console.log('Receiver name matches:', receiver.name);
    
                if (amount === totalP) {
                    console.log('Amount matches:', amount);
    
                    if (transRef) {
                        console.log('Transaction reference exists:', transRef);
                    
                        const existingReservation = await Reservation.findOne({ 'Payment.transRef': transRef }).exec();
                        if (existingReservation) {
                            console.error('Duplicate transaction reference detected:', transRef);
                            socket.emit('uploadSlipError', {
                                success: false,
                                message: 'สลิปของคุณเคยถูกใช้ไปแล้ว',
                            });
                            return; 
                        }
                    
                        
                        const paymentData = {
                            transRef,
                            sender,
                            receiver,
                            transTime,
                            transDate,
                            amount,
                            status: 'success',
                        };
                        reservation.Payment.push(paymentData);
                        await reservation.save();
                        socket.emit('uploadSlipSuccess', {
                            success: true,
                            message: 'ชำระเงินเสร็จสิ้น',
                            reservationId: reservation
                        });
                        console.log('Payment information updated successfully');
                    
                    } else {
                        console.error('Transaction reference is missing');
                        socket.emit('uploadSlipError', {
                            success: false,
                            message: 'สลิปของคุณเคยถูกใช้ไปแล้ว',
                        });
                    }
                } else {
                    console.error('Amount mismatch:', amount, '!=', totalP);
                    socket.emit('uploadSlipError', {
                        success: false,
                        message: 'จำนวนเงินไม่ถูกต้อง',
                    });
                }
            } else {
                console.error('Receiver name mismatch:', receiver?.name);
                socket.emit('uploadSlipError', {
                    success: false,
                    message: 'ชื่อบัญชีผู้รับไม่ถูกต้อง',
                });
            }
        } catch (error) {
            console.error('Error uploading slip:', error.message);
            socket.emit('uploadSlipError', {
                success: false,
                message: 'Error uploading slip',
                error: error.message,
            });
        }
    });

    socket.on('leaveRoom', () => {
        console.log('Client disconnected');
        connectedUsers[socket.id] = {};
    });
});

const uri = "mongodb+srv://finalProject:EFpeUnSek3qtwsMf@cluster0.xoovbhu.mongodb.net/finalProject?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        server.listen(8000, () => {
            console.log('API is running on port 8080 http://localhost:8000/');
        });
    })
    .catch((err) => console.log(err));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
