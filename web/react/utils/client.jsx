// See License.txt for license information.

var BrowserStore = require('../stores/browser_store.jsx');
var TeamStore = require('../stores/team_store.jsx');

module.exports.track = function(category, action, label, prop, val) {
    global.window.snowplow('trackStructEvent', category, action, label, prop, val);
    global.window.analytics.track(action, {category: category, label: label, property: prop, value: val});
};

module.exports.trackPage = function() {
    global.window.snowplow('trackPageView');
    global.window.analytics.page();
};

function handleError(methodName, xhr, status, err) {
    var LTracker = global.window.LTracker || [];

    var e = null;
    try {
        e = JSON.parse(xhr.responseText);
    } catch(parseError) {
        e = null;
    }

    var msg = '';

    if (e) {
        msg = 'error in ' + methodName + ' msg=' + e.message + ' detail=' + e.detailed_error + ' rid=' + e.request_id;
    } else {
        msg = 'error in ' + methodName + ' status=' + status + ' statusCode=' + xhr.status + ' err=' + err;

        if (xhr.status === 0) {
            e = {message: 'There appears to be a problem with your internet connection'};
        } else {
            e = {message: 'We received an unexpected status code from the server (' + xhr.status + ')'};
        }
    }

    console.error(msg); //eslint-disable-line no-console
    console.error(e); //eslint-disable-line no-console
    LTracker.push(msg);

    module.exports.track('api', 'api_weberror', methodName, 'message', msg);

    if (xhr.status === 401) {
        if (window.location.href.indexOf('/channels') === 0) {
            window.location.pathname = '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
        } else {
            var teamURL = window.location.href.split('/channels')[0];
            window.location.href = teamURL + '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
        }
    }

    return e;
}

module.exports.createTeamFromSignup = function(teamSignup, success, error) {
    $.ajax({
        url: '/api/v1/teams/create_from_signup',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(teamSignup),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('createTeamFromSignup', xhr, status, err);
            error(e);
        }
    });
};

module.exports.createUser = function(user, data, emailHash, success, error) {
    $.ajax({
        url: '/api/v1/users/create?d=' + encodeURIComponent(data) + '&h=' + encodeURIComponent(emailHash),
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(user),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('createUser', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_users_create', user.team_id, 'email', user.email);
};

module.exports.updateUser = function(user, success, error) {
    $.ajax({
        url: '/api/v1/users/update',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(user),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('updateUser', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_users_update');
};

module.exports.updatePassword = function(data, success, error) {
    $.ajax({
        url: '/api/v1/users/newpassword',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(data),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('newPassword', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_users_newpassword');
};

module.exports.updateUserNotifyProps = function(data, success, error) {
    $.ajax({
        url: '/api/v1/users/update_notify',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(data),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('updateUserNotifyProps', xhr, status, err);
            error(e);
        }
    });
};

module.exports.updateRoles = function(data, success, error) {
    $.ajax({
        url: '/api/v1/users/update_roles',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(data),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('updateRoles', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_users_update_roles');
};

module.exports.updateActive = function(userId, active, success, error) {
    var data = {};
    data.user_id = userId;
    data.active = '' + active;

    $.ajax({
        url: '/api/v1/users/update_active',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(data),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('updateActive', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_users_update_roles');
};

module.exports.sendPasswordReset = function(data, success, error) {
    $.ajax({
        url: '/api/v1/users/send_password_reset',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(data),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('sendPasswordReset', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_users_send_password_reset');
};

module.exports.resetPassword = function(data, success, error) {
    $.ajax({
        url: '/api/v1/users/reset_password',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(data),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('resetPassword', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_users_reset_password');
};

module.exports.logout = function() {
    module.exports.track('api', 'api_users_logout');
    var currentTeamUrl = TeamStore.getCurrentTeamUrl();
    BrowserStore.clear();
    window.location.href = currentTeamUrl + '/logout';
};

module.exports.loginByEmail = function(name, email, password, success, error) {
    $.ajax({
        url: '/api/v1/users/login',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify({name: name, email: email, password: password}),
        success: function onSuccess(data, textStatus, xhr) {
            module.exports.track('api', 'api_users_login_success', data.team_id, 'email', data.email);
            success(data, textStatus, xhr);
        },
        error: function onError(xhr, status, err) {
            module.exports.track('api', 'api_users_login_fail', window.getSubDomain(), 'email', email);

            var e = handleError('loginByEmail', xhr, status, err);
            error(e);
        }
    });
};

module.exports.revokeSession = function(altId, success, error) {
    $.ajax({
        url: '/api/v1/users/revoke_session',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify({id: altId}),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('revokeSession', xhr, status, err);
            error(e);
        }
    });
};

module.exports.getSessions = function(userId, success, error) {
    $.ajax({
        cache: false,
        url: '/api/v1/users/' + userId + '/sessions',
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('getSessions', xhr, status, err);
            error(e);
        }
    });
};

module.exports.getAudits = function(userId, success, error) {
    $.ajax({
        url: '/api/v1/users/' + userId + '/audits',
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('getAudits', xhr, status, err);
            error(e);
        }
    });
};

module.exports.getMeSynchronous = function(success, error) {
    var currentUser = null;
    $.ajax({
        async: false,
        cache: false,
        url: '/api/v1/users/me',
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        success: function gotUser(data, textStatus, xhr) {
            currentUser = data;
            if (success) {
                success(data, textStatus, xhr);
            }
        },
        error: function onError(xhr, status, err) {
            if (error) {
                var e = handleError('getMeSynchronous', xhr, status, err);
                error(e);
            }
        }
    });

    return currentUser;
};

module.exports.inviteMembers = function(data, success, error) {
    $.ajax({
        url: '/api/v1/teams/invite_members',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(data),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('inviteMembers', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_teams_invite_members');
};

module.exports.updateTeamDisplayName = function(data, success, error) {
    $.ajax({
        url: '/api/v1/teams/update_name',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(data),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('updateTeamDisplayName', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_teams_update_name');
};

module.exports.signupTeam = function(email, success, error) {
    $.ajax({
        url: '/api/v1/teams/signup',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify({email: email}),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('singupTeam', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_teams_signup');
};

module.exports.createTeam = function(team, success, error) {
    $.ajax({
        url: '/api/v1/teams/create',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(team),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('createTeam', xhr, status, err);
            error(e);
        }
    });
};

module.exports.findTeamByName = function(teamName, success, error) {
    $.ajax({
        url: '/api/v1/teams/find_team_by_name',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify({name: teamName}),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('findTeamByName', xhr, status, err);
            error(e);
        }
    });
};

module.exports.findTeamsSendEmail = function(email, success, error) {
    $.ajax({
        url: '/api/v1/teams/email_teams',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify({email: email}),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('findTeamsSendEmail', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_teams_email_teams');
};

module.exports.findTeams = function(email, success, error) {
    $.ajax({
        url: '/api/v1/teams/find_teams',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify({email: email}),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('findTeams', xhr, status, err);
            error(e);
        }
    });
};

module.exports.createChannel = function(channel, success, error) {
    $.ajax({
        url: '/api/v1/channels/create',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(channel),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('createChannel', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_channels_create', channel.type, 'name', channel.name);
};

module.exports.createDirectChannel = function(channel, userId, success, error) {
    $.ajax({
        url: '/api/v1/channels/create_direct',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify({user_id: userId}),
        success: success,
        error: function(xhr, status, err) {
            var e = handleError('createDirectChannel', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_channels_create_direct', channel.type, 'name', channel.name);
};

module.exports.updateChannel = function(channel, success, error) {
    $.ajax({
        url: '/api/v1/channels/update',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(channel),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('updateChannel', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_channels_update');
};

module.exports.updateChannelDesc = function(data, success, error) {
    $.ajax({
        url: '/api/v1/channels/update_desc',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(data),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('updateChannelDesc', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_channels_desc');
};

module.exports.updateNotifyLevel = function(data, success, error) {
    $.ajax({
        url: '/api/v1/channels/update_notify_level',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(data),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('updateNotifyLevel', xhr, status, err);
            error(e);
        }
    });
};

module.exports.joinChannel = function(id, success, error) {
    $.ajax({
        url: '/api/v1/channels/' + id + '/join',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('joinChannel', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_channels_join');
};

module.exports.leaveChannel = function(id, success, error) {
    $.ajax({
        url: '/api/v1/channels/' + id + '/leave',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('leaveChannel', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_channels_leave');
};

module.exports.deleteChannel = function(id, success, error) {
    $.ajax({
        url: '/api/v1/channels/' + id + '/delete',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('deleteChannel', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_channels_delete');
};

module.exports.updateLastViewedAt = function(channelId, success, error) {
    $.ajax({
        url: '/api/v1/channels/' + channelId + '/update_last_viewed_at',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('updateLastViewedAt', xhr, status, err);
            error(e);
        }
    });
};

function getChannels(success, error) {
    $.ajax({
        cache: false,
        url: '/api/v1/channels/',
        dataType: 'json',
        type: 'GET',
        success: success,
        ifModified: true,
        error: function onError(xhr, status, err) {
            var e = handleError('getChannels', xhr, status, err);
            error(e);
        }
    });
}
module.exports.getChannels = getChannels;

module.exports.getChannel = function(id, success, error) {
    $.ajax({
        cache: false,
        url: '/api/v1/channels/' + id + '/',
        dataType: 'json',
        type: 'GET',
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('getChannel', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_channel_get');
};

module.exports.getMoreChannels = function(success, error) {
    $.ajax({
        url: '/api/v1/channels/more',
        dataType: 'json',
        type: 'GET',
        success: success,
        ifModified: true,
        error: function onError(xhr, status, err) {
            var e = handleError('getMoreChannels', xhr, status, err);
            error(e);
        }
    });
};

function getChannelCounts(success, error) {
    $.ajax({
        cache: false,
        url: '/api/v1/channels/counts',
        dataType: 'json',
        type: 'GET',
        success: success,
        ifModified: true,
        error: function onError(xhr, status, err) {
            var e = handleError('getChannelCounts', xhr, status, err);
            error(e);
        }
    });
}
module.exports.getChannelCounts = getChannelCounts;

module.exports.getChannelExtraInfo = function(id, success, error) {
    $.ajax({
        url: '/api/v1/channels/' + id + '/extra_info',
        dataType: 'json',
        type: 'GET',
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('getChannelExtraInfo', xhr, status, err);
            error(e);
        }
    });
};

module.exports.executeCommand = function(channelId, command, suggest, success, error) {
    $.ajax({
        url: '/api/v1/command',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify({channelId: channelId, command: command, suggest: '' + suggest}),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('executeCommand', xhr, status, err);
            error(e);
        }
    });
};

module.exports.getPosts = function(channelId, offset, limit, success, error, complete) {
    $.ajax({
        cache: false,
        url: '/api/v1/channels/' + channelId + '/posts/' + offset + '/' + limit,
        dataType: 'json',
        type: 'GET',
        ifModified: true,
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('getPosts', xhr, status, err);
            error(e);
        },
        complete: complete
    });
};

module.exports.getPost = function(channelId, postId, success, error) {
    $.ajax({
        cache: false,
        url: '/api/v1/channels/' + channelId + '/post/' + postId,
        dataType: 'json',
        type: 'GET',
        ifModified: false,
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('getPost', xhr, status, err);
            error(e);
        }
    });
};

module.exports.search = function(terms, success, error) {
    $.ajax({
        url: '/api/v1/posts/search',
        dataType: 'json',
        type: 'GET',
        data: {terms: terms},
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('search', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_posts_search');
};

module.exports.deletePost = function(channelId, id, success, error) {
    $.ajax({
        url: '/api/v1/channels/' + channelId + '/post/' + id + '/delete',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('deletePost', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_posts_delete');
};

module.exports.createPost = function(post, channel, success, error) {
    $.ajax({
        url: '/api/v1/channels/' + post.channel_id + '/create',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(post),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('createPost', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_posts_create', channel.name, 'length', post.message.length);

    // global.window.analytics.track('api_posts_create', {
    //     category: 'api',
    //     channel_name: channel.name,
    //     channel_type: channel.type,
    //     length: post.message.length,
    //     files: (post.filenames || []).length,
    //     mentions: (post.message.match('/<mention>/g') || []).length
    // });
};

module.exports.updatePost = function(post, success, error) {
    $.ajax({
        url: '/api/v1/channels/' + post.channel_id + '/update',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(post),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('updatePost', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_posts_update');
};

module.exports.addChannelMember = function(id, data, success, error) {
    $.ajax({
        url: '/api/v1/channels/' + id + '/add',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(data),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('addChannelMember', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_channels_add_member');
};

module.exports.removeChannelMember = function(id, data, success, error) {
    $.ajax({
        url: '/api/v1/channels/' + id + '/remove',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(data),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('removeChannelMember', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_channels_remove_member');
};

module.exports.getProfiles = function(success, error) {
    $.ajax({
        cache: false,
        url: '/api/v1/users/profiles',
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        success: success,
        ifModified: true,
        error: function onError(xhr, status, err) {
            var e = handleError('getProfiles', xhr, status, err);
            error(e);
        }
    });
};

module.exports.uploadFile = function(formData, success, error) {
    var request = $.ajax({
        url: '/api/v1/files/upload',
        type: 'POST',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: success,
        error: function onError(xhr, status, err) {
            if (err !== 'abort') {
                var e = handleError('uploadFile', xhr, status, err);
                error(e);
            }
        }
    });

    module.exports.track('api', 'api_files_upload');

    return request;
};

module.exports.getFileInfo = function(filename, success, error) {
    $.ajax({
        url: '/api/v1/files/get_info' + filename,
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('getFileInfo', xhr, status, err);
            error(e);
        }
    });
};

module.exports.getPublicLink = function(data, success, error) {
    $.ajax({
        url: '/api/v1/files/get_public_link',
        dataType: 'json',
        type: 'POST',
        data: JSON.stringify(data),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('getPublicLink', xhr, status, err);
            error(e);
        }
    });
};

module.exports.uploadProfileImage = function(imageData, success, error) {
    $.ajax({
        url: '/api/v1/users/newimage',
        type: 'POST',
        data: imageData,
        cache: false,
        contentType: false,
        processData: false,
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('uploadProfileImage', xhr, status, err);
            error(e);
        }
    });
};

module.exports.importSlack = function(fileData, success, error) {
    $.ajax({
        url: '/api/v1/teams/import_team',
        type: 'POST',
        data: fileData,
        cache: false,
        contentType: false,
        processData: false,
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('importTeam', xhr, status, err);
            error(e);
        }
    });
};

module.exports.getStatuses = function(success, error) {
    $.ajax({
        url: '/api/v1/users/status',
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('getStatuses', xhr, status, err);
            error(e);
        }
    });
};

module.exports.getMyTeam = function(success, error) {
    $.ajax({
        url: '/api/v1/teams/me',
        dataType: 'json',
        type: 'GET',
        success: success,
        ifModified: true,
        error: function onError(xhr, status, err) {
            var e = handleError('getMyTeam', xhr, status, err);
            error(e);
        }
    });
};

module.exports.updateValetFeature = function(data, success, error) {
    $.ajax({
        url: '/api/v1/teams/update_valet_feature',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(data),
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('updateValetFeature', xhr, status, err);
            error(e);
        }
    });

    module.exports.track('api', 'api_teams_update_valet_feature');
};

function getConfig(success, error) {
    $.ajax({
        url: '/api/v1/config/get_all',
        dataType: 'json',
        type: 'GET',
        ifModified: true,
        success: success,
        error: function onError(xhr, status, err) {
            var e = handleError('getConfig', xhr, status, err);
            error(e);
        }
    });
}
module.exports.getConfig = getConfig;
