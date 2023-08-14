import { makeAutoObservable } from 'mobx';
import { IUser } from '../models/IUser';
import AuthService from '../services/AuthService';
import axios from 'axios';
import { AuthResponse } from '../models/AuthResponse';
import { API_URL } from '../http';
import UserService from '../services/UserService';

export default class Store {
	user = {} as IUser
	isAuth = false
	isLoading = false
	users = [] as IUser[]

	constructor() {
		makeAutoObservable(this)
	}

	setAuth(bool: boolean) {
		this.isAuth = bool
	}

	setUser(user: IUser) {
		this.user = user
	}

	setIsLoading(bool: boolean) {
		this.isLoading = bool
	}

	setUsers(users: IUser[]) {
		this.users = users
	}

	async login(email: string, password: string) {
		try {
			const res = await AuthService.login(email, password)
			localStorage.setItem('token', res.data.accessToken)
			this.setAuth(true)
			this.setUser(res.data.user)
		} catch (e) {
			console.log(e)
		}
	}

	async registration(email: string, password: string) {
		try {
			const res = await AuthService.registration(email, password)
			localStorage.setItem('token', res.data.accessToken)
			this.setAuth(true)
			this.setUser(res.data.user)
		} catch (e) {
			console.log(e)
		}
	}

	async logout() {
		try {
			const res = await AuthService.logout()
			localStorage.removeItem('token')
			this.setAuth(false)
			this.setUser({} as IUser)
		} catch (e) {
			console.log(e)
		}
	}

	async checkAuth() {
		this.setIsLoading(true)
		try {
			// обращаемся вручную, тк статус 401 и интерспетор будет выполнять лишнию работу
			const res = await axios.get<AuthResponse>(`${API_URL}/refresh`, {
				withCredentials: true
			})
			localStorage.setItem('token', res.data.accessToken)
			this.setAuth(true)
			this.setUser(res.data.user)
		} catch (e) {
			console.log(e)
		} finally {
			this.setIsLoading(false)
		}
	}

	async getUsers() {
		try {
			const res = await UserService.fetchUsers()
			this.setUsers(res.data)
		} catch (e) {
			console.log(e)
		}
	}
}