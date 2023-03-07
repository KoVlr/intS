export async function fetch_tokens(context, username, password) {
    let formdata = new FormData();
    formdata.set('username', username);
    formdata.set('password', password);

    let response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        body: formdata
    });
    if (response.ok) {
        let token = await response.json();
        context.setToken(token);
        return true;
    }
    else return false;
}


export async function fetch_refresh_tokens(context) {
    let response = await fetch('/api/auth/refresh_tokens', {
        method: 'POST'
    });
    if (response.ok) {
        let token = await response.json();
        context.token = token;
        context.setToken(token);
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
    if (context.token === null || isExpired(context.token)) {
        await fetch_refresh_tokens(context);
    }
}



export async function fetch_create_user(username, email, password) {
    let response = await fetch('http://127.0.0.1:8000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });
        if (response.ok){
            let user = await response.json();
            return user;
        }
        else return false;
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
        await fetch_refresh_tokens(context);
        return author;
    }
}



export async function fetch_create_course(context, course_name, description, is_public) {
    await refresh_if_exp(context);

    let response = await fetch('http://127.0.0.1:8000/api/courses/new', {
        method: 'POST',
        headers: {
            Authorization: `${context.token.token_type} ${context.token.access_token}`,
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            name: course_name,
            description: description,
            is_public: is_public
        })
    });
    if (response.ok){
        let course = await response.json();
        return course;
    }
    else return false;
}



export async function fetch_article(context, article_id) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/articles/${article_id}`, {
        method: 'GET',
        headers: {
            Authorization: `${context.token.token_type} ${context.token.access_token}`
        }
    });
    if (response.ok) {
        let article = await response.json();
        return article;
    }
}


export async function fetch_change_article_name(context, article_id, new_name) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/articles/${article_id}/name?new_name=${new_name}`, {
        method: 'POST',
        headers: {
            Authorization: `${context.token.token_type} ${context.token.access_token}`
        }
    });
    if (response.ok) {
        let article = await response.json();
        return article;
    }
}


export async function fetch_publish_article(context, article_id) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/articles/${article_id}/publish`, {
        method: 'POST',
        headers: {
            Authorization: `${context.token.token_type} ${context.token.access_token}`
        }
    });
    if (response.ok) {
        let article = await response.json();
        return article;
    }
}


export async function fetch_article_content(context, article_id) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/articles/${article_id}/content`, {
        method: 'GET',
        headers: {
            Authorization: `${context.token.token_type} ${context.token.access_token}`
        }
    });
    if (response.ok) {
        let article = await response.json();
        return article;
    }
}


export async function fetch_save_content(context, article_id, content) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/articles/${article_id}/content`, {
        method: 'POST',
        headers: {
            Authorization: `${context.token.token_type} ${context.token.access_token}`,
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({"content": content})
    });
    if (response.ok) {
        let article = await response.json();
        return article;
    }
}


export async function fetch_article_images(context, article_id) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/articles/${article_id}/images`, {
        method: 'GET',
        headers: {
            Authorization: `${context.token.token_type} ${context.token.access_token}`
        }
    });
    if (response.ok) {
        let images = await response.json();
        return images;
    }
}


export async function fetch_upload_images(context, article_id, files) {
    await refresh_if_exp(context);

    let formdata = new FormData();
    for (let i = 0; i < files.length; i++) {
        formdata.append('files', files[i])
    }

    let response = await fetch(`http://127.0.0.1:8000/api/articles/${article_id}/images`, {
        method: "POST",
        headers: {
            Authorization: `${context.token.token_type} ${context.token.access_token}`
        },
        body: formdata
    });
    if (response.ok) {
        let article_and_images = await response.json();
        return article_and_images;
    }
}


export async function fetch_delete_image(context, image_id) {
    await refresh_if_exp(context);

    let response = await fetch(`http://127.0.0.1:8000/api/images/${image_id}`, {
        method: "DELETE",
        headers: {
            Authorization: `${context.token.token_type} ${context.token.access_token}`
        }
    });
    if (response.ok) {
        let article = await response.json();
        return article;
    }
}