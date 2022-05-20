const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHtml': '{{#label}} must not include HTML!',
    },
    rules: {
        escapeHtml: {
            validate(value, helpers) {
                const opts = (tags, attr) => ({
                    allowedTags: tags,
                    allowedAttributes: attr
                });
                const filtered = sanitizeHtml(value, opts(false, false)); // allow all tags and attributes
                const clean = sanitizeHtml(value, opts([], {})); // don't allow all tags and all attributes
                // compare the sanitized values, if there are HTML tags in the orig value, run helpers.error
                // will allow other special characters (&, <, >, ...)
                if (clean !== filtered) return helpers.error('string.escapeHtml');
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHtml(),
        location: Joi.string().required().escapeHtml(),
        price: Joi.number().min(0).required(),
        // image: Joi.string().required(),
        description: Joi.string().required().escapeHtml()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        body: Joi.string().required().escapeHtml()
    }).required()
});