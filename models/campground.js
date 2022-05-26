const mongoose = require('mongoose');
const { cloudinary } = require('../cloudinary');
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

// https://res.cloudinary.com/dbhv1lwyz/image/upload/w_200/v1651888828/MyYelpCamp/jske8tifg2j4weolzlps.jpg
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true }, timestamps: true };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
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
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
            <p>${this.description.substring(0, 20)}...</p>`;
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

CampgroundSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Campground', CampgroundSchema);