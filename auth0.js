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
        store.user.loaded = true;
        
        if(checkLS()){
            localStorage.setItem('user_pic', pic);
            localStorage.setItem('user_name', prof.name);
        }
        
        window.location.reload();
    });
}
