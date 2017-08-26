/* misc functions */
function checkLS(){
    if(!window.localStorage){ return false }

    var testKey = 'test', storage = window.localStorage;
    
    try {
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return true;
    }catch(error){
        return false;
    }
}

function $(tag){
    return document.querySelector(tag);
}

function gae(category, action, label){
    if(debug){ return; }
    
    if(!category){ category='uncategorized'; }
    if(!action){ action='default'; }
    if(!label){ label=''; }

    ga(function(t){
        if(typeof(label)=="string"){ label = [label]; }
        label.unshift(t.get('userId'));

        ga('send', 'event', category, action, label.join(';'));
    });
}

function get_page(id){
    return store.pages[id];
}

/* global store - default value*/
var store = {
    pages:{
        list: [],
        save: [],
        featured: [],
        featured_default: []
    },
    user:{
        id_tkn: null,
        acc_tkn: null,
        picture: null, 
        id: null,
        name: null, 
        loaded: false,
        untrack: false
    },
    reset_user: function(){
        for(key in this.user){
            this.user[key] = null;
        }
    
        if(checkLS()){
            localStorage.removeItem('id_tkn');
            localStorage.removeItem('acc_tkn');
            localStorage.removeItem('user_pic');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_track');
        }
    }
};

if(checkLS()){
    store.user.id_tkn = localStorage.getItem('id_tkn');
    store.user.acc_tkn = localStorage.getItem('acc_tkn');
    store.user.id = localStorage.getItem('user_id');
    store.user.picture = localStorage.getItem('user_pic');
    store.user.name = localStorage.getItem('user_name');
    store.user.untrack = localStorage.getItem('user_track');
}

if(!store.user.picture || !store.user.name){
    store.user.picture = "http://i.imgur.com/Rl9HuJv.jpg";
    store.user.name = "Mr. Popular";
    
    // already logged in, get profile details 
    if(store.user.id_tkn){
        res = {
            idToken:store.user.id_tkn,
            accessToken:store.user.acc_tkn
        };
        auth0_getProf(res);
    }
}else{
    store.user.loaded = true;
}

/* default featured */
store.pages.featured_default = [
    'featured-telegram'
];
store.pages['featured-telegram'] = {
    featured: 'http://i.imgur.com/ysPDcyt.png',
    featured_link: 'http://www.google.com'
};
