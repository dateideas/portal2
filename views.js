var FORM_CONTRIBUTE = 'https://docs.google.com/forms/d/e/1FAIpQLSfzRAaCJlZd0iXAehjAWs0zT5NcALjwnXdXX338E5Mk0EWnug/viewform';
var FORM_CONTACT = 'https://insights.hotjar.com/s?siteId=533832&surveyId=25873';

// CardView and ListView
var CardView = function(obj){
    function gen_image(){
        return [{
            class: 'card__info card__info--save',
            saved: obj.saved,
            onclick: function(evt){
                if(!this.saved){ this.saved = true; }else{
                    this.saved = false;
                }

                api.save(obj.id);
                evt.stopPropagation();
            }
        },{
            $type: 'img',
            src: obj.pic
        }];
    }

    function gen_info(){
        var lis = [];

        if(obj.price){
            lis.push(gen_li('card__info card__info--price', obj.price));
        }

        if(obj.place){
            lis.push(gen_li('card__info card__info--place', obj.place));
        }

        return lis;
    }

    function gen_li(cname, text){
        return {
            class:cname,
            $text:text
        };
    }

    return {
        class: 'card',
        onclick: function(){
            goto('view/'+obj['id']);
        },
        $components: [{
            class: 'section',
            $components:[{
                $type: 'h3',
                $text: obj.title,
            },{
                class:'card__img',
                $components: gen_image()
            },{
                class:'card__text',
                $components: gen_info()
            },{
                class:'card__text',
                $text:obj.desc
            }]
        }]
    };
};

var ListView = function(id){
    if(!id){ id='list'; }

    return {
        id:id,
        class:'list row',
        style:'height:auto;',
        _update: function(objs){
            this.$components = objs.map(CardView);
        }
    };
};

// HeaderView & Buffer
var HeaderView = function(){
    var gen_link = function(href, text){
        return {
            $type:'a',
            $text:text,
            href: href
        };
    };

    var gen_user = function(){
        return {
            $type:'a',
            class:'header__user',
            href:'#/user',
            $components:[{
                class:'header__user__dpic',
                $type:'img',
                src:store.user.picture
            }, {
                class:'header__user__name',
                $type:'span',
                $text:store.user.name
            }]
        };
    }

    return {
        id:'header',
        class:'container',
        $components:[{
            class:'header row',
            $components:[{
                class:'col-sm',
                $components:[{
                    $type:'a',
                    href:'#/list',
                    $components:[{ 
                        $type:'img',
                        class:'header__logo',
                        src:'assets/logo.png'
                    }]
                },
                    gen_link('#/about', 'About'),
                    gen_link(FORM_CONTRIBUTE, 'Contribute'),
                    gen_link(FORM_CONTACT, 'Contact')
                ]
            },{
                class:'col-sm',
                $components:[
                    gen_link('#/logout', 'Sign Out'),
                    gen_user()
                ]
            }]
        }]
    };
};

var HeaderBuffer = function(){
    return {
        'class':'hbuffer',
        $init: function(){
            this.style.height = $('#header').scrollHeight + 20;
        }
    };
};

// FeaturedView
var FeatureView = function(){
    return {
        id:'featured',
        $components:[],
        _components:[{
            class:'featured__overlay',
            $components:[{
                class:'featured__overlay__arrow',
                $text:'&#xf104;',
                onclick: function(){
                    $('#featured')._prev();
                }
            }, {
                class:'featured__overlay__arrow',
                $text:'&#xf105;',
                onclick: function(){
                    $('#featured')._next();
                }
            }]
        },{
            $type:'img',
            class:'featured__image'
        }],
        _index: -1,
        _update: function(val){
            var featured = store.pages.featured;
            this._index += val + featured.length;
            this._index %= featured.length;

            $('.featured__image').src = get_page(store.pages.featured[this._index]).featured;
        },
        _activate:function(){
            this.$components = this._components;

            store.pages.featured.map(function(id){
                (new Image).src = get_page(id).featured;
            });

            setTimeout(function(){
               $('.featured__image').src = get_page(store.pages.featured[0]).featured;
            });
        },
        _next:function(){ this._update(1); },
        _prev:function(){ this._update(-1); }
    };
};

// UserView
var UserView = function(){
    var modal_phone1 = {
        class:'section',
        $components:[{
                $type:'label',
                for:'modal-phone1',
                class:'close'
            },{
                class:'modal__header',
                $text:'Chat Notifications'
            },{
                class:'modal__info',
                $text:'This service allows us to notify you on Telegram when new dateIdeas have been posted.'
            },{
                class:'modal__subtitle',
                $text:'Enter your phone number (without ext)'
            },{
                $type:'input',
                id:'sms-phone',
                type:'number',
                placeHolder:'SG number w/o ext'
            },{
                $type:'button',
                class:'modal__submit',
                $text:'Send code to me',
                onclick: function(){
                    var num = $('#sms-phone').value;
                    if(num.length != 8){
                        return alert('Please enter a valid phone number.');
                    }

                    api.smsCheck(num);
                    activate_phone1();
                }
            },{
                $type:'a',
                class:'modal__info',
                $text:'I do not consent. Please log me out.',
                onclick: function(){
                    goto('logout');
                }
            }]
        };

    var modal_phone2 = {
        class:'section',
        $components:[{
                class:'modal__header',
                $text:'Chat Notifications'
            },{
                class:'modal__subtitle',
                $text:'Enter 6 digit verification code'
            },{
                $type:'input',
                id:'sms-code',
                type:'number',
                placeHolder:'6 digit code'
            },{
                $type:'button',
                class:'modal__submit',
                $text:'Verify number',
                onclick: function(){
                    var num = $('#sms-code').value;
                    if(num.length != 6){
                        return alert('Double check your code');
                    }

                    api.smsConfirm(num);
                    activate_phone2();
                }
            },{
                $type:'a',
                class:'modal__info',
                $text:'Let me try that again',
                onclick: function(){
                    window.location.reload();
                }
            }]
        };

    var genTab = function(partialId, tabText, activated){
        var objs = [{
            id:'tab-'+partialId,
            $type:'input',
            type:'radio',
            name:'tabs-user',
            'aria-hidden':true
        },{
            $type:'label',
            class:'user__tabs__label',
            $text:tabText,
            for:'tab-'+partialId,
            'aria-hidden':true
        },
        ListView('list--'+partialId)];

        if(activated){
            objs[0].checked = true;
        }

        return objs;
    };

    return {
        id:'user',
        $components:[{
            $type:'img',
            class:'user__img',
            src:store.user.picture
        },{
            $type:'h2',
            class:'user__name',
            $text:store.user.name
        },{
            $type:'label',
            for:'modal-phone1',
            class:'user__phone',
            $text:'update phone number'
        },{
            $type:'input',
            id:'modal-phone1',
            type:'checkbox'
        },{
            class:'modal',
            $components:[{
                class:'card',
                $components:[modal_phone1]
            }]
        },{
            $type:'input',
            id:'modal-phone2',
            type:'checkbox'
        },{
            class:'modal',
            $components:[{
                class:'card',
                $components:[modal_phone2]
            }]
        },
        HeaderBuffer(),
        {
            class:'tabs',
            $components:
                genTab('faves', 'favourites', true).concat(
                genTab('ideas', 'saved ideas'))
        }]
    };
};

// Main View
var MainView = function(){
    var HeroView = {
        class:'hero',
        $components:[{
            class:'hero__overlay',
            $components:[{
                $type:'img',
                src:'assets/logo.png',
                class:'hero__logo'
            },{
                $type:'button',
                $text:'Get Started',
                onclick: function(){
                    goto('login');
                }
            }]
        }]
    };

    var gen_card = function(pic, title, text){
        return {
            class:'card',
            $components:[{
                class:'section',
                $components:[{
                    $type:'img',
                    class:'info__image',
                    src:pic
                },{
                    class:'info__title',
                    $text:title
                },{
                    class:'info__text',
                    $text:text
                }]
            }]
        };
    };

    var InfoView = {
        class:'info',
        $components:[
            gen_card(
                'assets/header-1.png',
                'New Experience',
                'We will be pushing out the latest hangout spots for you to enjoy!'
            ),
            gen_card(
                'assets/header-2.png',
                'Varying Genre',
                'Keep your experience fresh as we give you different kinds of date activities!'
            ),
            gen_card(
                'assets/header-3.png',
                'Contribute',
                'Send us your special date recommendations and get them featured in weekly recommendations'
            )
        ]
    };

    var CoverImg = {
        class:'cover'
    };

    return {
        $components:[{
            id:'main',
            $components:[
                CoverImg,
                HeroView,
                InfoView
            ],
            $init:function(){
                setTimeout(function(){
                    api.getPreview();
                },1000);
            }
        },{
            class:'preview--header',
            $components:[{
                class:'preview--header__title',
                $text:'Preview'
            },{
                class:'preview--header__subtitle',
                $text:'Sign up to receive the full experience'
            }]
        }]
    };
};

// ContentView && ContentDisplayView
var ContentView = function(){
    return {
        id:'details',
        class:'tabs',
        $components:[],
        $init: function(){
            var pids = window.location.hash.split('/')[2].split('_');
            this.$components = [];

            var ele = this;
            api.loadPage(pids[0], function(){
                $('#details')._update(store.pages[pids[0]]);
            });
        },
        _update: function(obj){
            var content = [];

            if(obj.price){
                content.push({
                    class:'content__info__price',
                    $text:obj.price
                });
            }

            if(obj.place){
                content.push({
                    class:'content__info__place',
                    $text:obj.place
                });
            }

            content.push({
                class:'content__title',
                $text:obj.title
            });

            content.push({
                class:'content__details',
                $init:function(){
                    this.innerHTML = obj.text;
                }
            });

            $('#details').$components = [{
                id:'tab-details',
                $type:'input',
                type:'radio',
                name:'tabs-content',
                checked:true,
                'aria-hidden':true
            },{
                $type:'label',
                class:'details--tabs__label',
                $text:'Details',
                for:'tab-details',
                'aria-hidden':true
            },{
                class:'details--tabs__content',
                $components: content
            },{
                id:'tab-comments',
                $type:'input',
                type:'radio',
                name:'tabs-content',
                'aria-hidden':true
            },{
                $type:'label',
                class:'details--tabs__label',
                $text:'Comments',
                for:'tab-comments',
                'aria-hidden':true
            },{
                class:'details--tabs__content',
                $components: [{
                    id:'disqus_thread',
                    $init:function(){
                        window.disqus_config = function(){
                            this.page.identifier = '/view/'+obj.id;
                            this.page.url = window.location.href.replace('/#/', '/');
                            console.log(this.page.identifier);
                            console.log(this.page.url);
                        };

                        if(!window.DISQUS){

                            var d = document, s = d.createElement('script');
                            s.src = 'https://dateideas-2.disqus.com/embed.js';
                            s.setAttribute('data-timestamp', +new Date());
                            (d.head || d.body).appendChild(s);
                        }else{
                            window.DISQUS.reset({
                                reload:true,
                                config:window.disqus_config
                            });
                        }
                    }
                }]
            }];
        }
    };
};

var ContentDisplayView = function(){
    function gen_diplay(pid, main){
        var eleclass = 'content--display';
        if(main){
            eleclass += ' content--display__main';
        }

        return {
            class:eleclass,
            $type:'img',
            _pid:pid,
            $init:function(){
                var ele = this;
                api.loadPage(pid, function(){
                    ele.src = store.pages[pid]['pic'];
                });
            }
        };
    }

    return {
        id:'content--display',
        $components:[],
        $init: function(){
            var pids = window.location.hash.split('/')[2].split('_');
            this.$components = [];

            this.$components.push(gen_diplay(pids[0], true));
        }
    };
};

var AboutView = function(){
    var gen_person = function(img, name, text){
        return {
            class:'person',
            $components:[{
                $type:'img',
                class:'person__img',
                src:img
            },{
                class:'person__name',
                $text:name
            },{
                class:'person__text',
                $text:text
            }]
        };
    };

    return {
        class:'about',
        $components:[
            gen_person('//lorempixel.com/200/200', 'Raimie Tang', 'Mastermind'),
            gen_person('//lorempixel.com/201/201', 'Shu Peng', 'Code Man'),
            gen_person('//lorempixel.com/202/202', 'Manfred', 'DateIdea Man'),
            gen_person('//lorempixel.com/203/203', 'Pattany', 'Design Woman')
        ]
    };
};

function ContributeView(){
    var gen_input = function(name, placeHolder, type){
        if(!type){ type='input'; }

        return {
            $type:type,
            name:name,
            placeHolder:placeHolder,
            rows:'5'
        };
    };

    return {
        class:'contribute',
        $components:[{
            class:'cover'
        },
            HeaderBuffer(),
        {
            class:'title',
            $text:'Contribute'
        },{
            class:'subtitle',
            $text:'Share your special place with us'
        },{
            $type:'form',
            action:'https://docs.google.com/forms/d/e/1FAIpQLSfzRAaCJlZd0iXAehjAWs0zT5NcALjwnXdXX338E5Mk0EWnug/formResponse', 
            method:'POST',
            $components:[
                gen_input('emailAddress', 'Your e-mail'),
                gen_input('entry.1567473725', 'Your name'),
                gen_input('entry.2137145260', 'Name of place'),
                gen_input('entry.328328862', 'Genre'),
                gen_input('entry.999594195', 'Share with us why you love this place', 'textarea'),
                {
                    $type:'button',
                    $text:'send'
                }
            ]
        }]
    };
}

var $root = {
    $cell:true,
    $type:'body',
    $components: [],
    $update: function(){
        this._funcs.forEach(function(f){
            if(f){ f(); }
        });
    },
    _funcs: [],
    _update: function(objs, funcs){
        this.$components = objs;

        if(typeof(funcs)){
            this._funcs = [funcs];
        }else{
            this._funcs = funcs;
        }
    }
};

// modal activations
function activate_phone1(){
    $('#modal-phone1').checked = (!$('#modal-phone1').checked);
}

function activate_phone2(){
    $('#modal-phone2').checked = (!$('#modal-phone2').checked);
}
