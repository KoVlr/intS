import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {TokenContext} from "./app.jsx";

function LoginForm(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const context = useContext(TokenContext);

    const handleSubmit = async function(event) {
        event.preventDefault();

        let formdata = new FormData();
        formdata.set('username', username);
        formdata.set('password', password);

        let response = await fetch('http://127.0.0.1:8000/auth/token', {
            method: 'POST',
            body: formdata
        });
        if (response.ok){
            let token = await response.json();
            context.setToken(token);
            navigate("/");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Вход</legend>
                <label>
                    username:
                    <input name="username" type="text" value={username} onChange={(event)=>setUsername(event.target.value)}/>
                </label>
                <label>
                    password:
                    <input name="password" type="text" value={password} onChange={(event)=>setPassword(event.target.value)}/>
                </label>
                <input type="submit" value="Войти"/>
            </fieldset>
        </form>
    );
}

// class LoginForm extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             username: "",
//             password: "",
//         }
//         this.handleChange_username = this.handleChange_username.bind(this);
//         this.handleChange_password = this.handleChange_password.bind(this);
//         this.handleSubmit = this.handleSubmit.bind(this);
//     }

//     handleChange_username(event) {
//         this.setState({username: event.target.value});
//     }

//     handleChange_password(event) {
//         this.setState({password: event.target.value});
//     }

//     async handleSubmit(event) {
//         event.preventDefault();

//         let formdata = new FormData();
//         formdata.set('username', this.state.username);
//         formdata.set('password', this.state.password);

//         let response = await fetch('http://127.0.0.1:8000/auth/token', {
//             method: 'POST',
//             body: formdata
//         });
//         if (response.ok){
//             let token = await response.json();
//             this.props.onLogin(token);
//         }
//     }

//     render() {
//         return (
//             <form onSubmit={this.handleSubmit}>
//                 <fieldset>
//                     <legend>Вход</legend>
//                     <label>
//                         username:
//                         <input name="username" type="text" value={this.state.username} onChange={this.handleChange_username}/>
//                     </label>
//                     <label>
//                         password:
//                         <input name="password" type="text" value={this.state.password} onChange={this.handleChange_password}/>
//                     </label>
//                     <input type="submit" value="Войти"/>
//                 </fieldset>
//             </form>
//         );
//     }
// }

export default LoginForm;