const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
  locationName: {
    type: String,
    required: true
  },
  position: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 2;
      },
      message: props => `位置必須有緯度和經度兩個值！`
    }
  },
  username: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['一般報告 📝', '針對動物的毒害 ⚠️', '動物虐待 🆘']
  },
  contactInfo: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pin', pinSchema); 