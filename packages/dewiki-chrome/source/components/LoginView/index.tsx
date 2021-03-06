import React, {
    useState,
    useEffect,
} from 'react';

import {
    PluridPureButton,
} from '@plurid/plurid-ui-react';

import { Theme } from '@plurid/plurid-themes';

import {
    StyledLoginView,
    StyledLoginInput,
} from './styled';

import ButtonInline from '../ButtonInline';
import CreateAccountButton from '../CreateAccountButton';
import InputText from '../InputText';

import client from '../../services/graphql/client';
import {
    LOGIN_BY_USERNAME,
    LOGIN_BY_EMAIL,
} from '../../services/graphql/mutate';



interface LoginViewProps {
    theme: Theme;
    cancelLoginView: () => void;
    setLoggedInUser: (user: any) => any;
    setUserToken: (token: string) => void;
    setRefreshUserToken: (refreshToken: string) => void;
}


const isEmail = (value: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(value).toLowerCase());
}


const LoginView: React.FC<LoginViewProps> = (props) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showLoginButton, setShowLoginButton] = useState(false);
    const [loginWithEmail, setLoginWithEmail] = useState(false);
    const [loggingMessage, setLoggingMessage] = useState('');
    const [loadingButton, setLoadingButton] = useState(false);

    const {
        theme,
        cancelLoginView,
        setLoggedInUser,
        setUserToken,
        setRefreshUserToken,
    } = props;

    useEffect(() => {
        if (username.length !== 0 && password.length !==0) {
            setShowLoginButton(true);
        } else {
            setShowLoginButton(false);
        }

        if (isEmail(username)) {
            setLoginWithEmail(true);
        } else {
            setLoginWithEmail(false);
        }
    }, [username, password]);

    const login = async () => {
        try {
            setLoadingButton(true);
            if (loginWithEmail) {
                const mutate = await client.mutate({
                    mutation: LOGIN_BY_EMAIL,
                    variables: {
                        email: username,
                        password,
                    }
                });

                const response = mutate.data.loginByEmail;
                setLoadingButton(false);

                if (!response.status) {
                    setLoggingMessage('could not login. try again');
                    setTimeout(() => {
                        setLoggingMessage('');
                    }, 2000);
                    return;
                }

                if (response.data.products.depict !== null) {
                    setLoggedInUser(response.data);
                    cancelLoginView();
                }
            }

            const mutate = await client.mutate({
                mutation: LOGIN_BY_USERNAME,
                variables: {
                    username,
                    password,
                },
            });

            const response = mutate.data.loginByUsername;
            setLoadingButton(false);

            if (!response.status) {
                setLoggingMessage('could not login. try again.');
                setTimeout(() => {
                    setLoggingMessage('');
                }, 2000);
                return;
            }

            if (response.data.user.products.depict !== null) {
                setLoggedInUser(response.data.user);
                setUserToken(response.data.token);
                setRefreshUserToken(response.data.refreshToken);
                cancelLoginView();
            }
        } catch (error) {
        }
    }

    return (
        <StyledLoginView>
            <StyledLoginInput>
                <InputText
                    theme={theme}
                    value={username}
                    placeholder="username or email"
                    atChange={(event: any) => setUsername(event.target.value)}
                />
            </StyledLoginInput>

            <StyledLoginInput>
                <InputText
                    theme={theme}
                    value={password}
                    placeholder="password"
                    password={true}
                    atChange={(event: any) => setPassword(event.target.value)}
                />
            </StyledLoginInput>

            <div
                style={{height: '40px', width: '90%', margin: '0 auto', marginBottom: '20px'}}
            >
                {showLoginButton && (
                    <PluridPureButton
                        theme={theme}
                        text={loginWithEmail ? 'Login with Email' : 'Login'}
                        atClick={login}
                        loading={loadingButton}
                        level={1}
                    />
                )}
            </div>

            <div
                style={{display: 'flex', alignItems: 'center', height: '20px', justifyContent: 'space-around'}}
            >
                {!loggingMessage && (
                    <>
                        <ButtonInline
                            atClick={cancelLoginView}
                            theme={theme}
                        >
                            cancel
                        </ButtonInline>

                        <CreateAccountButton
                            theme={theme}
                        />
                    </>
                )}

                {loggingMessage && (
                    <div>
                        {loggingMessage}
                    </div>
                )}
            </div>
        </StyledLoginView>
    );
}


export default LoginView;
