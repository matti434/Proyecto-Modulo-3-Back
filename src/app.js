const express = require ('express');
const cors = require('cors');
const config = require('./config/config');
const routes = require('./routes');
const {errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

const allowedOrigins = [
    config.frontendUrl,
    'https://vermillion-rugelach-551560.netlify.app', 
    'http://localhost:5000',
    'http://localhost:5173',
];

const corsOptions = {
    origin: (origin, callback) => {
        
        if (!origin) return callback(null, true);

        if(allowedOrigins.includes(origin)){
            callback(null,origin);
        } else if(config.nodeEnv === 'development'){
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
        environment:config.nodeEnv,
    });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;