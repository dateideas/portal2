var FORM_CONTRIBUTE = 'https://docs.google.com/forms/d/e/1FAIpQLSfzRAaCJlZd0iXAehjAWs0zT5NcALjwnXdXX338E5Mk0EWnug/formResponse';
var FORM_CONTACT = 'https://docs.google.com/forms/d/e/1FAIpQLSdvI_SQJynFxle1j-yakIMA382w0kpBzF_g_NX4ZiauxCngpg/formResponse';

var SMEDIA_FB = '';
var SMEDIA_LK = '';
var SMEDIA_TW = '';
var SMEDIA_YT = '';

// CardView and ListView
var CardView = function(obj){
    function gen_image(){
        return [{
            class: 'card__info card__info--save',
            saved: obj.saved,
            onclick: function(evt){
                if(!this.saved){
                    this.saved = true;
                    ga_send_event('saves_save', obj.id);
                }else{
                    this.saved = false;
                    ga_send_event('saves_unsave', obj.id);
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
        
        if(obj.time){
            lis.push(gen_li('card__info card__info--ptime', obj.time));
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
            class:'header row nomobile',
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
                    gen_link('#/contribute', 'Contribute'),
                    gen_link('#/contact', 'Contact')
                ]
            },{
                class:'col-sm',
                $components:[
                    gen_link('#/logout', 'Sign Out'),
                    gen_user()
                ]
            }]
        },{
            $type:'header',
            class:'header row mobile',
            $components:[{
                class:'left',
                $components:[{
                    $type:'label',
                    for:'sidebar',
                    class:'.drawer-toggle',
                    $text:'&#xf0c9;'
                },{
                    $type:'a',
                    href:'#/list',
                    $components:[{ 
                        $type:'img',
                        class:'header__logo',
                        src:'assets/logo.png'
                    }]
                }]
            },
                gen_user()
            ]
        },{
            $type:'input',
            type:'checkbox',
            id:'sidebar'
        },{
            class:'drawer mobile',
            $components:[{
                $type:'label',
                for:'sidebar',
                class:'close'
            },
                gen_link('#/about', 'About'),
                gen_link('#/contribute', 'Contribute'),
                gen_link('#/contact', 'Contact'),
                gen_link('#/logout', 'Sign Out')    
            ]
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
                onclick: function(e){
                    $('#featured')._prev();
                    e.stopPropagation();
                }
            }, {
                class:'featured__overlay__arrow',
                $text:'&#xf105;',
                onclick: function(e){
                    $('#featured')._next();
                    e.stopPropagation();
                }
            }],
            onclick: function(){
                $('#featured')._onclick();
            }
        },{
            $type:'img',
            class:'featured__image'
        }],
        _index: 0,
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
        _prev:function(){ this._update(-1); },
        _onclick:function(){
            var id = store.pages.featured[this._index];
            var url = store.pages[id].featured_link;
            
            ga_send_event('featured_click', id);
            if(url){ 
                ga_outbound(url); 
            }
            else{
                goto('view/'+id);
            }
        }
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
                $text:'This service allows us to notify you on Telegram when new dateIdeas have been posted. No worries, you can always unsub from us :)'
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
            $text:'edit phone number'
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
        ListView('list--faves')]
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
                src:'assets/logo-padded.png',
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
            {
                'class':'info__overlay mobile',
                $components:[{
                    class:'arrow',
                    $text:'&#xf104;',
                    onclick:function(){
                        $('.info')._show(-1);
                    }
                },{
                    class:'arrow',
                    $text:'&#xf105;',
                    onclick:function(){
                        $('.info')._show(1);
                    }
                }]
            },
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
        ],
        val: 0,
        _show: function(diff){
            this.val += diff;
            this.val %= 3;
            
            for(var i=0; i<3; i++){ 
                var ele = $('.info .card:nth-child('+(i+2)+')');
                 
                ele.style.display = (this.val==i)?'inline-block':'none';
            }
        }
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
                    class:'content__info content__info--price',
                    $text:obj.price
                });
            }

            if(obj.place){
                content.push({
                    class:'content__info content__info--place',
                    $text:obj.place
                });
            }

            if(obj.time){
                content.push({
                    class:'content__info content__info--ptime',
                    $text:obj.time
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
    
    var form = [
        gen_input('entry.768945183', 'Your e-mail'),
        gen_input('entry.1567473725', 'Your name'),
        gen_input('entry.2137145260', 'Name of place'),
        gen_input('entry.328328862', 'Genre'),
        gen_input('entry.999594195', 'Share with us why you love this place', 'textarea'),
        {
            $type:'button',
            $text:'send'
        }
    ];

    return {
        class:'contribute',
        $components:[{
            class:'content',
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
                class:'nomobile',
                action:FORM_CONTRIBUTE,
                method:'POST',
                $components:form
            }]
        },{
            $type:'form',
            class:'mobile',
            action:FORM_CONTRIBUTE,
            method:'POST',
            $components:form 
        }]
    };
}

function ContactUsView(){
    var gen_input = function(name, placeHolder, type){
        if(!type){ type='input'; }

        return {
            $type:type,
            name:name,
            placeHolder:placeHolder,
            rows:'5'
        };
    };

    var gen_link = function(text, link){
        return {
            $type:'a',
            $text:text,
            href:link
        }
    };
    
    var form = [{
            class:'smedia',
            $components:[
                gen_link('&#xf082;', SMEDIA_FB),
                gen_link('&#xf08c;', SMEDIA_LK),
                gen_link('&#xf081;', SMEDIA_TW),
                gen_link('&#xf166;', SMEDIA_YT),
            ]
        },
        gen_input('entry.848403666', 'Your email'),
        gen_input('entry.2080510831', 'Your name'),
        gen_input('entry.473017666', 'Leave your message here :)', 'textarea'),
        {
            $type:'button',
            $text:'send'
        }
    ];

    return {
        class:'contactus',
        $components:[{
            'class':'content',
            $components:[{
                class:'cover'
            },
                HeaderBuffer(),
            {
                class:'title',
                $text:'Contact Us'
            },{
                class:'subtitle',
                $text:'Feedback? Ideas? Problems?'
            },{
                $type:'form',
                class:'nomobile',
                action:FORM_CONTACT,
                method:'POST',
                $components:form
            }]
        },{
            $type:'form',
            class:'mobile',
            action:FORM_CONTACT,
            method:'POST',
            $components:form 
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
