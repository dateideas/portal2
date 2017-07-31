var api = {
    base: 'https://dateideas-ongspxm.rhcloud.com',
    
    // base function 
    send: function(url, func, openReq){
        var id_tkn = store.user.id_tkn;
        if(!id_tkn && !openReq){
            return false;
        }

        var req = new XMLHttpRequest();
        req.open("GET", this.base+url);
        req.setRequestHeader('Authorization', 'Bearer '+id_tkn);
        
        req.onreadystatechange = function(){
            if(this.readyState==4){
                try{
                    obj = JSON.parse(this.responseText);
                }catch(err){
                    obj = {'ok':false, 'msg':err.message};
                }
                
                // TODO: default 403 forbidden error

                func(obj);
            }
        };

        req.send();        
        return req;
    },

    // content
    getPreview: function(){
        this.send('/preview', function(obj){
            if(obj.ok){
                store.pages.list = [];
                store.pages.list = obj['latest'];

                obj['pages'].forEach(function(page){
                    var p_id = page['id']; 
                    store.pages[p_id] = page;
                });
                
                $('#preview')._update(store.pages.list.map(get_page));
            }
        }, true);
    },
    
    getList: function(){
        this.send('/list', function(obj){
            if(obj.ok){
                store.pages.list = [];
                store.pages.list = obj['latest'];
                store.pages.featured = obj['featured'];

                obj['pages'].forEach(function(page){
                    var p_id = page['id']; 
                    store.pages[p_id] = page;
                });

                $('#list')._update(store.pages.list.map(get_page));
                $('#featured')._activate();
            }
        });
    },
   
    // saves
    getSave: function(){
        this.send('/listsave', function(obj){
            if(obj.ok){
                store.pages.save = [];
                obj = obj['pages'];
                for(var i in obj){
                    var p_id = obj[i]['id'];
                    store.pages.save.push(p_id);
                    store.pages[p_id] = obj[i];
                }
                 
                $('#list--faves')._update(store.pages.save.map(get_page));
            }
        });
    },
    save: function(pid){
        this.send('/save?pid='+pid, function(obj){ 
            if(!obj.ok){
                alert('Unable to save article, try again later?');
            }
        });
    },

    // user 
    getUser: function(){
        this.send('/user', function(obj){
            if(obj.ok){
                if(!obj.verified){
                    return activate_phone1();
                }
                
                api.getSave();
            }
        });
    },

    // sms 
    smsCheck: function(num){
        this.send('/sms_check?num=65'+num, function(obj){
            if(obj.ok){
                gae('phoneNum', 'check', num);
                alert('Check your phone, the SMS will be there in a short while');
                
                activate_phone2();
            }else{
                var msg = obj.error;
                
                if(!msg){ msg = 'Did you key in the right number?'; }
                
                alert(msg);
                activate_phone1();
            }
        })
    },
    smsConfirm: function(code){
        this.send('/sms_confirm?code='+code, function(obj){
            if(obj.ok){
                gae('phoneNum', 'confirm');
                
                alert('All done. We will now updated you with our new Date Ideas');
                window.location.reload();
            }else{
                alert('Have you got the code right?');
                activate_phone2();
            }
        })
    },
    
    getPage: function(pid, ele){
        if(!ele){ ele = $('#details'); }
        
        this.loadPage(pid, function(){
            ele._update(store.pages[pid]);
        });
    },
    
    loadPage: function(pid, func){
        // load default first article
        if(!pid && store.pages.list){
            pid = store.pages.list[0];
        }
        
        if(!pid){
            goto('');
        }
        
        if(pid && store.pages[pid] && func){
             setTimeout(func);
        }else{
            var query = '?id='+pid;
            
            this.send('/content'+query, function(obj){
                if(obj.ok){
                    delete(obj.ok);
                    store.pages[pid] = obj;
                    
                    if(func){ func(); }
                }else{
                    alert('error: '+obj.error);
                }
            });
        }
    }
};

var debug = false;
if(window.location.host.startsWith('localhost')){
    api.base = 'http://localhost:8080';
    debug = true;
}
