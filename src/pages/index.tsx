import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import LoginForm from '../components/loginForm/LoginForm'
import ShowConnectionState from '../components/ShowConnectionState'

const Home: NextPage = () => {
    return (
        <div >
            <main className={styles.main}>
                <div>
                    <LoginForm />
                    <ShowConnectionState />
                </div>
            </main>
        </div>
    )
}

export default Home