const express = require ('express');
const cors = require('cors');
const config = require('./config/config');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];

const corsOptions = {
    origin: (origin, callback) => {
        if(!origin || allowedOrigins.includes(origin))

        if(allowedOrigins.includes(origin)){
            callback(null,origin);
        } else if(config.env === 'development'){
            callback(null,true);
        }
        else{
            callback(null,false);
        }
    },
    credentials:true,
    methods:['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders:['Content-Type','Authorization']
    
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/health', (req,res) => {
    res.json({
        status:'ok',
        timestamp:new Date(),
        environment:config.env,
    });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;