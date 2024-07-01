const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function (v) {
                return v <= Date.now();
            },
            message: 'Date of birth cannot be in the future'
        }
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', ''],
        default: '',
    },
    address: {
        city: {
            type: String,
            trim: true,
            maxlength: 100,
            default: '',
        },
        state: {
            type: String,
            trim: true,
            maxlength: 100,
            default: '',
        },
        country: {
            type: String,
            trim: true,
            maxlength: 100,
            default: '',
        }
    },
    phoneNumber: {
        type: Number,
        validate: {
            validator: function (v) {
                return /\d{10}/.test(v);
            },
            message: 'Phone number must be 10 digits'
        }
    },
    profilePictureUrl: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+/, 'Please enter a valid URL'],
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
    },
    lastLogin: {
        type: Date,
    }
},{
    strict: 'throw'
});

exports.User = mongoose.model('User', userSchema);