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
        return token;
    }
}


export async function fetch_refresh_tokens() {
    let response = await fetch('/api/auth/tokens', {
        method: 'POST'
    });
    if (response.ok) {
        let token = await response.json();
        return token;
    }
}


function get_auth_header(token) {
    if (token) {
        return {Authorization: `${token.token_type} ${token.access_token}`};
    } else {
        return {};
    }
}


function isExpired(token) {
    let token_exp_ms = token.expires * 1000;
    let margin_ms = 3000;
    let current_date = new Date();
    let time_until_exp = token_exp_ms - current_date.getTime() - current_date.getTimezoneOffset()*60000;
    return time_until_exp < margin_ms;
}


async function refresh_if_exp(context) {
    if (context.token && isExpired(context.token)) {
        let token = await fetch_refresh_tokens();
        if (token) {
            context.token = token;
            context.setToken(token);
        }
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
}


export async function fetch_user(context) {
    await refresh_if_exp(context);

    let response = await fetch('/api/users/me', {
        method: 'GET',
        headers: get_auth_header(context.token)
    });
    if (response.ok) {
        let user = await response.json();
        return user;
    }
}


export async function fetch_logout(context) {
    await refresh_if_exp(context);

    let response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: get_auth_header(context.token)
    });
    if (response.ok) {
        return true;
    }
}


export async function fetch_become_author(context) {
    await refresh_if_exp(context);

    let response = await fetch('/api/authors', {
        method: 'POST',
        headers: get_auth_header(context.token)
    });
    if (response.ok) {
        let author = await response.json();
        return author;
    }
}



export async function fetch_create_course(context, course_name, description, is_public) {
    await refresh_if_exp(context);

    let response = await fetch('http://127.0.0.1:8000/api/courses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            ...get_auth_header(context.token)
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
}


export async function fetch_all_courses(context, offset, limit) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/courses?offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers: get_auth_header(context.token)
    });
    if (response.ok) {
        let courses = await response.json();
        return courses;
    }
}


export async function fetch_my_courses(context, offset, limit) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/courses/mine?offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers: get_auth_header(context.token)
    });
    if (response.ok) {
        let courses = await response.json();
        return courses;
    }
}


export async function fetch_collection(context, offset, limit) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/courses/collection?offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers: get_auth_header(context.token)
    });
    if (response.ok) {
        let courses = await response.json();
        return courses;
    }
}


export async function fetch_course(context, course_id) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/courses/${course_id}`, {
        method: 'GET',
        headers: get_auth_header(context.token)
    });
    if (response.ok) {
        let course = await response.json();
        return course;
    }
}


export async function fetch_course_drafts(context, course_id) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/courses/${course_id}/drafts`, {
        method: 'GET',
        headers: get_auth_header(context.token)
    });
    if (response.ok) {
        let drafts = await response.json();
        return drafts;
    }
}


export async function fetch_change_course(context, course_id, update_data) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/courses/${course_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            ...get_auth_header(context.token)
        },
        body: JSON.stringify(update_data)
    });
    if (response.ok) {
        let course_data = await response.json();
        return course_data;
    }
}


export async function fetch_get_access(context, course_id, access_code) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/courses/${course_id}/access`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            ...get_auth_header(context.token)
        },
        body: JSON.stringify({
            access_code: access_code
        })
    });
    if (response.ok){
        return 'success';
    }
}


export async function fetch_add_to_collection(context, course_id) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/courses/collection/${course_id}`, {
        method: 'POST',
        headers: get_auth_header(context.token)
    });
    if (response.ok){
        return 'success';
    }
}


export async function fetch_delete_from_collection(context, course_id) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/courses/collection/${course_id}`, {
        method: 'DELETE',
        headers: get_auth_header(context.token)
    });
    if (response.ok){
        return 'success';
    }
}


export async function fetch_create_article(context, article_name, course_id) {
    await refresh_if_exp(context);

    let response = await fetch('http://127.0.0.1:8000/api/articles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            ...get_auth_header(context.token)
        },
        body: JSON.stringify({
            name: article_name,
            course_id: course_id
        })
    });
    if (response.ok){
        let article = await response.json();
        return article;
    }
}


export async function fetch_article(context, article_id) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/articles/${article_id}`, {
        method: 'GET',
        headers: get_auth_header(context.token)
    });
    if (response.ok) {
        let article = await response.json();
        return article;
    }
}


export async function fetch_change_article_name(context, article_id, new_name) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/articles/${article_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            ...get_auth_header(context.token)
        },
        body: JSON.stringify({'name': new_name})
    });
    if (response.ok) {
        let article = await response.json();
        return article;
    }
}


export async function fetch_publish_article(context, article_id) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/articles/${article_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            ...get_auth_header(context.token)
        },
        body: JSON.stringify({'is_published': true})
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
        headers: get_auth_header(context.token)
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
            'Content-Type': 'application/json;charset=utf-8',
            ...get_auth_header(context.token)
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
        headers: get_auth_header(context.token)
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
        headers: get_auth_header(context.token),
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
        headers: get_auth_header(context.token)
    });
    if (response.ok) {
        let article = await response.json();
        return article;
    }
}


export async function fetch_article_view(context, article_id) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/articles/${article_id}/view`, {
        method: 'GET',
        headers: get_auth_header(context.token)
    });
    if (response.ok) {
        let view = await response.json();
        return view;
    }
}


export async function fetch_comments(context, article_id, reply_to, offset, limit) {
    await refresh_if_exp(context);

    let response = await fetch(`/api/articles/${article_id}/comments?`+ (reply_to!==null ? `reply_to=${reply_to}&` : '') + `offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers: get_auth_header(context.token)
    });
    if (response.ok) {
        let comments = await response.json();
        return comments;
    }
}