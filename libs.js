// auth0
var auth0_lock = new Auth0Lock(
    'U5LYZTWEZGOIoIwng2byGTSB7KeVFzQK', 
    'ongspxm.auth0.com'
);

auth0_lock.on('authenticated', auth0_getProf);
    
function auth0_getProf(res){ 
    if(checkLS()){
        localStorage.setItem('id_tkn', res.idToken);
        localStorage.setItem('acc_tkn', res.accessToken);
    }
    
    goto('list');

    auth0_lock.getUserInfo(res.accessToken, function(err, prof) {
        if(err){
            if(debug){ console.log(err); }
            return route_logout();
        }

        pic = prof.picture_large;
        if(!pic){
            pic = prof.picture;
        }

        store.user.picture = pic;
        store.user.name = prof.name;
        store.user.id = prof.sub;
        store.user.loaded = true;

        if(checkLS()){
            localStorage.setItem('user_pic', pic);
            localStorage.setItem('user_name', prof.name);
            localStorage.setItem('user_id', prof.sub);
        } 

        window.location.reload();
    });
}

// google analytics
function ga_set_uid(){
    if(store.user.untrack){ return; }
	ga('set', 'userId', store.user.id);
}

function ga_send_page(page){
    ga_set_uid();
    ga('send',{
        'hitType':'pageview',
        'page':page
    });
}

function ga_send_event(action, desc){
    ga_set_uid();

    ga('send', 'event', {
        'eventCategory':action,
        'eventAction':desc,
        'eventLabel':store.user.id
    });
}

function ga_outbound(url){
    ga_set_uid();

    ga_send_event('outbound_click', url);
    document.location.href = url;
}
