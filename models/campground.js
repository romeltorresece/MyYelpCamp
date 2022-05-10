const mongoose = require('mongoose');
const { cloudinary } = require('../cloudinary');
const { Schema } = mongoose;

const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String
});
// https://res.cloudinary.com/dbhv1lwyz/image/upload/w_200/v1651888828/MyYelpCamp/jske8tifg2j4weolzlps.jpg
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc && doc.reviews.length) {
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
    if (doc && doc.images.length) {
        for (let img of doc.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);