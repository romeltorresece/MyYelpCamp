if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const Review = require('../models/review');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/my-yelp-camp';
mongoose.connect(dbUrl)
    .then(() => {
        console.log('MONGO CONNECTION OPEN!');
    })
    .catch(err => {
        console.log('CONNECTION ERROR!');
        console.log(err);
    });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for (let i = 0; i < 400; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground(
            {
                author: '626bddceb46fa7f7d84a8b9e',
                title: `${sample(descriptors)} ${sample(places)}`,
                location: `${cities[random1000].city}, ${cities[random1000].state}`,
                geometry: { type: 'Point', coordinates: [ cities[random1000].longitude, cities[random1000].latitude ] },
                images: [
                    {
                        url: 'https://res.cloudinary.com/dbhv1lwyz/image/upload/v1651843253/MyYelpCamp/jfbour3owcxdlw4jfalh.jpg',
                        filename: 'MyYelpCamp/jfbour3owcxdlw4jfalh',
                    },
                    {
                        url: 'https://res.cloudinary.com/dbhv1lwyz/image/upload/v1651843256/MyYelpCamp/mpu70szhp0fy7teo3yex.jpg',
                        filename: 'MyYelpCamp/mpu70szhp0fy7teo3yex',
                    }
                ],
                description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum, suscipit. A sequi officiis voluptatibus quaerat provident dolorem expedita aspernatur nemo earum, veniam vero non, architecto doloribus placeat? Ducimus, exercitationem voluptas.',
                price
            }
        );
        await camp.save();
    }
};

seedDB()
    .then(() => {
        mongoose.connection.close();
    });