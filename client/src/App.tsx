import { FC, useContext, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import { Context } from './index';
import { observer } from 'mobx-react-lite';

const App: FC = () => {
  const { store } = useContext(Context)

  useEffect(() => {
    if (localStorage.getItem('token')) {
      store.checkAuth()
    }
  }, [])

  if (store.isLoading) {
    return <div>загрузка</div>
  }

  if (!store.isAuth) {
    return <>
      <div>авторизуйтесь</div>
      <LoginForm />
      <button onClick={() => store.getUsers()}>Пользователи</button>
    </>
  }

  return (
    <div>
      <h1>{`авторизован ${store.user.email} и ${store.user.isActivated ? 'активирован' : 'не активирован'} аккаунт по почте`}</h1>
      <button onClick={() => store.logout()}>Выйти</button>
      <button onClick={() => store.getUsers()}>Пользователи</button>
      {store.users.map(user =>
        <div key={user.email}>{user.email}</div>
      )}
    </div>
  );
}

export default observer(App);
