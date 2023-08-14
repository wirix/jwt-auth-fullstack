const userModel = require('../models/user-model')
const mailService = require('../service/mail-service')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const tokenService = require('../service/token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')

class UserService {
	async registration(email, password) {
		const candidate = await userModel.findOne({ email })
		if (candidate) {
			throw ApiError.BadRequest('Пользователь уже существует')
		}
		const hashPassword = await bcrypt.hash(password, 3)
		const activationLink = uuid.v4()
		const user = await userModel.create({ email, password: hashPassword, activationLink })

		await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

		const userDto = new UserDto(user)
		const tokens = tokenService.generateTokens({ ...userDto })
		await tokenService.saveToken(userDto.id, tokens.refreshToken)
		return {
			...tokens,
			user: userDto
		}
	}

	async activate(activationLink) {
		const user = await userModel.findOne({ activationLink })
		if (!user) {
			throw ApiError.BadRequest('Некоректная ссылка активации')
		}
		user.isActivated = true
		await user.save()
	}

	async login(email, password) {
		const user = await userModel.findOne({ email })
		if (!user) {
			throw ApiError.BadRequest('Аккаутна с такой почтой не существует')
		}

		const isPassEqual = await bcrypt.compare(password, user.password)
		if (!isPassEqual) {
			throw ApiError.BadRequest('Пароль неверный')
		}

		const userDto = new UserDto(user)
		const tokens = tokenService.generateTokens({ ...userDto })
		await tokenService.saveToken(userDto.id, tokens.refreshToken)
		return {
			...tokens,
			user: userDto
		}
	}

	async logout(refreshToken) {
		const token = await tokenService.removeToken(refreshToken)
		return token
	}

	async refresh(refreshToken) {
		if (!refreshToken) {
			throw ApiError.UnauthorizedError()
		}

		const userData = tokenService.validateRefreshToken(refreshToken)
		const tokenFromDb = await tokenService.findToken(refreshToken)
		if (!(userData && tokenFromDb)) {
			throw ApiError.UnauthorizedError()
		}

		const user = await userModel.findById(userData.id)
		const userDto = new UserDto(user)
		const tokens = tokenService.generateTokens({ ...userDto })

		await tokenService.saveToken(userDto.id, tokens.refreshToken)
		return {
			...tokens,
			user: userDto
		}
	}

	async getAllUsers() {
		return await userModel.find()
	}
}

module.exports = new UserService()