function route_list(){
    api.getList();
}

function route_user(){
    api.getUser();
}

function route_view(){
    var hash = window.location.hash.split('/');
    if(hash.length != 3){ goto(''); }
}

function route_logout(){
    store.reset_user();
    auth0_lock.logout();
    goto('');
}

function route_login(){
    if(!store.user.loaded){
        auth0_lock.show();
    }else{
        return goto('list');
    }
}

function route_untrack(){
    store.user.untrack = true;
    if(checkLS()){
        localStorage.setItem('user_track', true);
    }
    
    return goto('list');
}

/* defaults */
var navbar = [HeaderView(), HeaderBuffer()];

var ROUTES = {
    '#/list': navbar.concat([FeatureView(), ListView()]),
    '#/user': navbar.concat([UserView()]),
    '#/view': navbar.concat([ContentDisplayView(), ContentView()]),
    '#/about': navbar.concat([AboutView()]),
    '#/contact': [HeaderView(), ContactUsView()],
    '#/contribute': [HeaderView(), ContributeView()],
    '#/landing': [MainView(), ListView('preview')]
};

var FUNCS = {
    '#/list': route_list,
    '#/user': route_user,
    '#/view': route_view,
    '#/login': route_login,
    '#/logout': route_logout,
    '#/untrack': route_untrack
};

function get_match(list, key){
    for(item in list){
        if(key.startsWith(item)){
            return list[item];
        }
    }

    return null;
}

function route(){
    var hash = window.location.hash;
    var routes = get_match(ROUTES, hash);
    var func = get_match(FUNCS, hash); 

    // restricted access
    if(!store.user.loaded && func && func!=route_login){ 
        return goto('landing');
    }

    // wrong link redirected
    if(!func && !routes){
        if(store.user.loaded){
            return goto('list');
        }else{
            return goto('landing');
        }
    } 

    ga_send_page(hash);

    document.body._update(routes, func);
}

function goto(hash){
    window.location.hash = '#/'+hash;
}

window.onhashchange = route;
window.onload = route;
