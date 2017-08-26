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
	ga('set', 'userId', store.user.id);
}

function ga_send_page(page){
    ga_set_uid();
    ga('send',{
        'hitType':'pageview',
        'page':page
    });
}

function ga_send_event(cat, action, label){
    ga_set_uid();

    label = store.user.id + '|' + label;
    ga('send', 'event', {
        'eventCategory':cat,
        'eventAction':action,
        'eventLabel':label
    });
}
