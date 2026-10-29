// import mongoose from 'mongoose';

// const storySchema = new mongoose.Schema({
//     user: {type: String, ref: 'User', required: true},
//     content: {type: String},
//     media_url: {type: String},
//     media_type: {type: String, enum: ['text', 'image', 'video']},
//     views_count: [{type: String, ref: 'User'}],
//     background_color: {type: String},
//     expiresAt: {
//         type: Date,
//         default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),  // 24 hours from creation
//         index: { expires: '0s' }   // optional: enables automatic MongoDB TTL deletion
//     }
// }, {timestamps: true, minimize: false})

// const Story = mongoose.model('Story', storySchema)

// export default Story;

import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  user: { type: String, ref: 'User', required: true },
  content: { type: String },
  media_url: { type: String },
  media_type: { type: String, enum: ['text', 'image', 'video'] },
  views_count: [{ type: String, ref: 'User' }],
  background_color: { type: String },
  // expiresAt: when this Date is reached, Mongo's TTL index will remove the doc
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from creation
  }
}, { timestamps: true, minimize: false });

// Create a TTL index - expire documents when `expiresAt` <= now
// expireAfterSeconds: 0 means delete exactly at expiresAt time
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Story = mongoose.model('Story', storySchema);

export default Story;
