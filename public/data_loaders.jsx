export async function fetch_refresh_tokens() {
    let response = await fetch('/api/auth/refresh_tokens', {
        method: 'POST'
    });
    if (response.ok) {
        let token = await response.json();
        return token;
    }
    else return null;
}


function isExpired(token) {
    let token_exp_ms = token.expires * 1000;
    let margin_ms = 3000;
    let current_date = new Date();
    let time_until_exp = token_exp_ms - current_date.getTime() - current_date.getTimezoneOffset()*60000;
    return time_until_exp < margin_ms;
}

async function refresh_if_exp(context) {
    if (isExpired(context.token)) {
        let new_token = await fetch_refresh_tokens();
        context.setToken(new_token);
    }
}


export async function fetch_user(context) {
    await refresh_if_exp(context);

    let response = await fetch('/api/user', {
        method: 'GET',
        headers: {
            Authorization: `${context.token.token_type} ${context.token.access_token}`
        }
    });
    if (response.ok) {
        let user = await response.json();
        return user;
    }
}

export async function fetch_become_author(context) {
    await refresh_if_exp(context);

    let response = await fetch('/api/become_author', {
        method: 'POST',
        headers: {
            Authorization: `${context.token.token_type} ${context.token.access_token}`
        }
    });
    if (response.ok) {
        let author = await response.json();
        let new_token = await fetch_refresh_tokens();
        context.setToken(new_token);
        return author;
    }
}