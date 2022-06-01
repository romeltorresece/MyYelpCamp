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
    ],
    slug: {
        type: String,
        unique: true
    }
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this.slug}">${this.title}</a></strong>
            <p>${this.description.substring(0, 20)}...</p>`;
});

CampgroundSchema.pre('save', async function(next) {
    try {
        // generate unique slug if campground is new or the title is modified
        if (this.isNew || this.isModified('title')) {
            this.slug = await generateUniqueSlug(this._id, this.title);
        }
        next();
    } catch (err) {
        next(err);
    }
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

const Campground = mongoose.model('Campground', CampgroundSchema);
module.exports = Campground;

async function generateUniqueSlug(id, campgroundTitle, slug) {
    try {
        // generate initial slug
        if (!slug) {
            slug = slugify(campgroundTitle);
        }
        // check if a campground exists with the generated slug
        const foundCampground = await Campground.findOne({ slug });
        // check if there is a campground or the found campground is the current campground
        if (!foundCampground || foundCampground._id.equals(id)) {
            return slug;
        }
        // if slug is not unique, create new slug
        const newSlug = slugify(campgroundTitle);
        // check again the uniqueness of slug by calling the function recursively
        return await generateUniqueSlug(id, campgroundTitle, newSlug);
    } catch (err) {
        throw new Error(err);
    }
}

function slugify(text) {
    const slug = text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
        .substring(0, 75);              // Trim at 75 characters
    return `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;    // Add 4 random digits to improve uniqueness
}