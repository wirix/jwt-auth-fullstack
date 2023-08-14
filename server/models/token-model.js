const { Schema, model } = require('mongoose')

const TokenSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User'},
	refreshToken: { type: String, require: true },
})
// 'Token' - название модели, вторым схему
module.exports = model('Token', TokenSchema)