const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a product description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a product price'],
    min: 0
  },
  images: [{
    type: String,
    required: [true, 'Please add at least one product image']
  }],
  category: {
    type: String,
    required: [true, 'Please add a product category'],
    enum: ['Scented', 'Unscented', 'Decorative', 'Seasonal']
  },
  scent: {
    type: String,
    required: function() {
      return this.category === 'Scented';
    }
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: 0,
    default: 0
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  dimensions: {
    height: {
      type: Number,
      required: true
    },
    diameter: {
      type: Number,
      required: true
    }
  },
  burnTime: {
    type: Number,
    required: true,
    description: 'Burn time in hours'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update rating when a review is added or modified
productSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.rating = this.reviews.reduce((acc, review) => review.rating + acc, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
