jQuery(document).ready(function ($) {
    $("#accordion:nth-child(1n)").accordion({
        heightStyle: "content",
        active: false,
        collapsible: true
    });
    $("#tabs").tabs();
});
/*!
 Shoelace.css dropdowns {version}
 (c) A Beautiful Site, LLC

 Released under the MIT license
 Source: https://github.com/claviska/shoelace-css
 */
//
// This script is required to make dropdowns interactive. Before loading it, you must include either
// jQuery or Zepto. You can load them locally or via CDN. You only need one.
//
// jQuery via CDN (34.6KB)
//
//   <script
//     src="https://code.jquery.com/jquery-3.2.1.min.js"
//     integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="
//     crossorigin="anonymous"></script>
//
// Zepto via CDN (9.7KB)
//
//   <script src="https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.min.js"></script>
//
// Dropdowns not working?
//   - Make sure you've loaded jQuery or Zepto before this script
//   - Make sure your dropdowns are structured properly per the docs
//   - Make sure your dropdown triggers are inside the dropdown container
//
(function () {
    /* eslint-env browser, jquery */
    /* global Zepto */
    'use strict';

    if (typeof jQuery === 'undefined' && typeof Zepto === 'undefined') {
        throw new Error('Theme dropdown require either jQuery or Zepto.');
    } else {
        (typeof jQuery === 'function' ? jQuery : Zepto)(function ($) {
            $(document)
                .on('click', function (event) {
                    var dropdown;
                    var menu;
                    var selectedItem;
                    var trigger;

                    // Watch for clicks on dropdown triggers
                    if ($(event.target).is('.dropdown-trigger')) {
                        dropdown = $(event.target).closest('.dropdown');
                        trigger = event.target;

                        // Close other dropdowns
                        $('.dropdown.active')
                            .not(dropdown)
                            .removeClass('active')
                            .trigger('hide');

                        // Ignore dropdowns that have the disabled class
                        if ($(trigger).is('.disabled, :disabled')) {
                            return;
                        }

                        // Toggle this dropdown
                        $(dropdown)
                            .toggleClass('active')
                            .trigger($(dropdown).is('.active') ? 'show' : 'hide');
                    } else {
                        menu = $(event.target).closest('.dropdown-menu');

                        // Watch for clicks on menu items
                        if (menu.length) {
                            dropdown = $(event.target).closest('.dropdown');
                            selectedItem = $(event.target).closest('a').get(0);

                            // If the user selected a menu item and it's not disabled, fire the select event
                            if (selectedItem && !$(selectedItem).is('.disabled')) {
                                $(dropdown).trigger('select', selectedItem);
                            }

                            // Prevent the page from scrolling since menu items are #links
                            event.preventDefault();
                        }

                        // Close dropdowns on all other clicks
                        $('.dropdown.active')
                            .removeClass('active')
                            .trigger('hide');
                    }
                })
                .on('keydown', function (event) {
                    // Close dropdowns on escape
                    if (event.keyCode === 27) {
                        $('.dropdown.active')
                            .removeClass('active')
                            .trigger('hide');
                    }
                });
        });
    }
})();

/*
 * SmartMenus jQuery v1.0.1
 * http://www.smartmenus.org/
 *
 * Copyright Vasil Dinkov, Vadikom Web Ltd.
 * http://vadikom.com/
 *
 * Released under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        // CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Global jQuery
        factory(jQuery);
    }
}(function ($) {

    var menuTrees = [],
        IE = !!window.createPopup, // detect it for the iframe shim
        mouse = false, // optimize for touch by default - we will detect for mouse input
        touchEvents = 'ontouchstart' in window, // we use this just to choose between toucn and pointer events, not for touch screen detection
        mouseDetectionEnabled = false,
        requestAnimationFrame = window.requestAnimationFrame || function (callback) {
                return setTimeout(callback, 1000 / 60);
            },
        cancelAnimationFrame = window.cancelAnimationFrame || function (id) {
                clearTimeout(id);
            };

    // Handle detection for mouse input (i.e. desktop browsers, tablets with a mouse, etc.)
    function initMouseDetection(disable) {
        var eNS = '.smartmenus_mouse';
        if (!mouseDetectionEnabled && !disable) {
            // if we get two consecutive mousemoves within 2 pixels from each other and within 300ms, we assume a real mouse/cursor is present
            // in practice, this seems like impossible to trick unintentianally with a real mouse and a pretty safe detection on touch devices (even with older browsers that do not support touch events)
            var firstTime = true,
                lastMove = null;
            $(document).bind(getEventsNS([
                ['mousemove', function (e) {
                    var thisMove = {x: e.pageX, y: e.pageY, timeStamp: new Date().getTime()};
                    if (lastMove) {
                        var deltaX = Math.abs(lastMove.x - thisMove.x),
                            deltaY = Math.abs(lastMove.y - thisMove.y);
                        if ((deltaX > 0 || deltaY > 0) && deltaX <= 2 && deltaY <= 2 && thisMove.timeStamp - lastMove.timeStamp <= 300) {
                            mouse = true;
                            // if this is the first check after page load, check if we are not over some item by chance and call the mouseenter handler if yes
                            if (firstTime) {
                                var $a = $(e.target).closest('a');
                                if ($a.is('a')) {
                                    $.each(menuTrees, function () {
                                        if ($.contains(this.$root[0], $a[0])) {
                                            this.itemEnter({currentTarget: $a[0]});
                                            return false;
                                        }
                                    });
                                }
                                firstTime = false;
                            }
                        }
                    }
                    lastMove = thisMove;
                }],
                [touchEvents ? 'touchstart' : 'pointerover pointermove pointerout MSPointerOver MSPointerMove MSPointerOut', function (e) {
                    if (isTouchEvent(e.originalEvent)) {
                        mouse = false;
                    }
                }]
            ], eNS));
            mouseDetectionEnabled = true;
        } else if (mouseDetectionEnabled && disable) {
            $(document).unbind(eNS);
            mouseDetectionEnabled = false;
        }
    }

    function isTouchEvent(e) {
        return !/^(4|mouse)$/.test(e.pointerType);
    }

    // returns a jQuery bind() ready object
    function getEventsNS(defArr, eNS) {
        if (!eNS) {
            eNS = '';
        }
        var obj = {};
        $.each(defArr, function (index, value) {
            obj[value[0].split(' ').join(eNS + ' ') + eNS] = value[1];
        });
        return obj;
    }

    $.SmartMenus = function (elm, options) {
        this.$root = $(elm);
        this.opts = options;
        this.rootId = ''; // internal
        this.accessIdPrefix = '';
        this.$subArrow = null;
        this.activatedItems = []; // stores last activated A's for each level
        this.visibleSubMenus = []; // stores visible sub menus UL's (might be in no particular order)
        this.showTimeout = 0;
        this.hideTimeout = 0;
        this.scrollTimeout = 0;
        this.clickActivated = false;
        this.focusActivated = false;
        this.zIndexInc = 0;
        this.idInc = 0;
        this.$firstLink = null; // we'll use these for some tests
        this.$firstSub = null; // at runtime so we'll cache them
        this.disabled = false;
        this.$disableOverlay = null;
        this.$touchScrollingSub = null;
        this.cssTransforms3d = 'perspective' in elm.style || 'webkitPerspective' in elm.style;
        this.wasCollapsible = false;
        this.init();
    };

    $.extend($.SmartMenus, {
        hideAll: function () {
            $.each(menuTrees, function () {
                this.menuHideAll();
            });
        },
        destroy: function () {
            while (menuTrees.length) {
                menuTrees[0].destroy();
            }
            initMouseDetection(true);
        },
        prototype: {
            init: function (refresh) {
                var self = this;

                if (!refresh) {
                    menuTrees.push(this);

                    this.rootId = (new Date().getTime() + Math.random() + '').replace(/\D/g, '');
                    this.accessIdPrefix = 'sm-' + this.rootId + '-';

                    if (this.$root.hasClass('sm-rtl')) {
                        this.opts.rightToLeftSubMenus = true;
                    }

                    // init root (main menu)
                    var eNS = '.smartmenus';
                    this.$root
                        .data('smartmenus', this)
                        .attr('data-smartmenus-id', this.rootId)
                        .dataSM('level', 1)
                        .bind(getEventsNS([
                            ['mouseover focusin', $.proxy(this.rootOver, this)],
                            ['mouseout focusout', $.proxy(this.rootOut, this)],
                            ['keydown', $.proxy(this.rootKeyDown, this)]
                        ], eNS))
                        .delegate('a', getEventsNS([
                            ['mouseenter', $.proxy(this.itemEnter, this)],
                            ['mouseleave', $.proxy(this.itemLeave, this)],
                            ['mousedown', $.proxy(this.itemDown, this)],
                            ['focus', $.proxy(this.itemFocus, this)],
                            ['blur', $.proxy(this.itemBlur, this)],
                            ['click', $.proxy(this.itemClick, this)]
                        ], eNS));

                    // hide menus on tap or click outside the root UL
                    eNS += this.rootId;
                    if (this.opts.hideOnClick) {
                        $(document).bind(getEventsNS([
                            ['touchstart', $.proxy(this.docTouchStart, this)],
                            ['touchmove', $.proxy(this.docTouchMove, this)],
                            ['touchend', $.proxy(this.docTouchEnd, this)],
                            // for Opera Mobile < 11.5, webOS browser, etc. we'll check click too
                            ['click', $.proxy(this.docClick, this)]
                        ], eNS));
                    }
                    // hide sub menus on resize
                    $(window).bind(getEventsNS([['resize orientationchange', $.proxy(this.winResize, this)]], eNS));

                    if (this.opts.subIndicators) {
                        this.$subArrow = $('<span/>').addClass('sub-arrow');
                        if (this.opts.subIndicatorsText) {
                            this.$subArrow.html(this.opts.subIndicatorsText);
                        }
                    }

                    // make sure mouse detection is enabled
                    initMouseDetection();
                }

                // init sub menus
                this.$firstSub = this.$root.find('ul').each(function () {
                    self.menuInit($(this));
                }).eq(0);

                this.$firstLink = this.$root.find('a').eq(0);

                // find current item
                if (this.opts.markCurrentItem) {
                    var reDefaultDoc = /(index|default)\.[^#\?\/]*/i,
                        reHash = /#.*/,
                        locHref = window.location.href.replace(reDefaultDoc, ''),
                        locHrefNoHash = locHref.replace(reHash, '');
                    this.$root.find('a').each(function () {
                        var href = this.href.replace(reDefaultDoc, ''),
                            $this = $(this);
                        if (href == locHref || href == locHrefNoHash) {
                            $this.addClass('current');
                            if (self.opts.markCurrentTree) {
                                $this.parentsUntil('[data-smartmenus-id]', 'ul').each(function () {
                                    $(this).dataSM('parent-a').addClass('current');
                                });
                            }
                        }
                    });
                }

                // save initial state
                this.wasCollapsible = this.isCollapsible();
            },
            destroy: function (refresh) {
                if (!refresh) {
                    var eNS = '.smartmenus';
                    this.$root
                        .removeData('smartmenus')
                        .removeAttr('data-smartmenus-id')
                        .removeDataSM('level')
                        .unbind(eNS)
                        .undelegate(eNS);
                    eNS += this.rootId;
                    $(document).unbind(eNS);
                    $(window).unbind(eNS);
                    if (this.opts.subIndicators) {
                        this.$subArrow = null;
                    }
                }
                this.menuHideAll();
                var self = this;
                this.$root.find('ul').each(function () {
                    var $this = $(this);
                    if ($this.dataSM('scroll-arrows')) {
                        $this.dataSM('scroll-arrows').remove();
                    }
                    if ($this.dataSM('shown-before')) {
                        if (self.opts.subMenusMinWidth || self.opts.subMenusMaxWidth) {
                            $this.css({width: '', minWidth: '', maxWidth: ''}).removeClass('sm-nowrap');
                        }
                        if ($this.dataSM('scroll-arrows')) {
                            $this.dataSM('scroll-arrows').remove();
                        }
                        $this.css({zIndex: '', top: '', left: '', marginLeft: '', marginTop: '', display: ''});
                    }
                    if (($this.attr('id') || '').indexOf(self.accessIdPrefix) == 0) {
                        $this.removeAttr('id');
                    }
                })
                    .removeDataSM('in-mega')
                    .removeDataSM('shown-before')
                    .removeDataSM('ie-shim')
                    .removeDataSM('scroll-arrows')
                    .removeDataSM('parent-a')
                    .removeDataSM('level')
                    .removeDataSM('beforefirstshowfired')
                    .removeAttr('role')
                    .removeAttr('aria-hidden')
                    .removeAttr('aria-labelledby')
                    .removeAttr('aria-expanded');
                this.$root.find('a.has-submenu').each(function () {
                    var $this = $(this);
                    if ($this.attr('id').indexOf(self.accessIdPrefix) == 0) {
                        $this.removeAttr('id');
                    }
                })
                    .removeClass('has-submenu')
                    .removeDataSM('sub')
                    .removeAttr('aria-haspopup')
                    .removeAttr('aria-controls')
                    .removeAttr('aria-expanded')
                    .closest('li').removeDataSM('sub');
                if (this.opts.subIndicators) {
                    this.$root.find('span.sub-arrow').remove();
                }
                if (this.opts.markCurrentItem) {
                    this.$root.find('a.current').removeClass('current');
                }
                if (!refresh) {
                    this.$root = null;
                    this.$firstLink = null;
                    this.$firstSub = null;
                    if (this.$disableOverlay) {
                        this.$disableOverlay.remove();
                        this.$disableOverlay = null;
                    }
                    menuTrees.splice($.inArray(this, menuTrees), 1);
                }
            },
            disable: function (noOverlay) {
                if (!this.disabled) {
                    this.menuHideAll();
                    // display overlay over the menu to prevent interaction
                    if (!noOverlay && !this.opts.isPopup && this.$root.is(':visible')) {
                        var pos = this.$root.offset();
                        this.$disableOverlay = $('<div class="sm-jquery-disable-overlay"/>').css({
                            position: 'absolute',
                            top: pos.top,
                            left: pos.left,
                            width: this.$root.outerWidth(),
                            height: this.$root.outerHeight(),
                            zIndex: this.getStartZIndex(true),
                            opacity: 0
                        }).appendTo(document.body);
                    }
                    this.disabled = true;
                }
            },
            docClick: function (e) {
                if (this.$touchScrollingSub) {
                    this.$touchScrollingSub = null;
                    return;
                }
                // hide on any click outside the menu or on a menu link
                if (this.visibleSubMenus.length && !$.contains(this.$root[0], e.target) || $(e.target).is('a')) {
                    this.menuHideAll();
                }
            },
            docTouchEnd: function (e) {
                if (!this.lastTouch) {
                    return;
                }
                if (this.visibleSubMenus.length && (this.lastTouch.x2 === undefined || this.lastTouch.x1 == this.lastTouch.x2) && (this.lastTouch.y2 === undefined || this.lastTouch.y1 == this.lastTouch.y2) && (!this.lastTouch.target || !$.contains(this.$root[0], this.lastTouch.target))) {
                    if (this.hideTimeout) {
                        clearTimeout(this.hideTimeout);
                        this.hideTimeout = 0;
                    }
                    // hide with a delay to prevent triggering accidental unwanted click on some page element
                    var self = this;
                    this.hideTimeout = setTimeout(function () {
                        self.menuHideAll();
                    }, 350);
                }
                this.lastTouch = null;
            },
            docTouchMove: function (e) {
                if (!this.lastTouch) {
                    return;
                }
                var touchPoint = e.originalEvent.touches[0];
                this.lastTouch.x2 = touchPoint.pageX;
                this.lastTouch.y2 = touchPoint.pageY;
            },
            docTouchStart: function (e) {
                var touchPoint = e.originalEvent.touches[0];
                this.lastTouch = {x1: touchPoint.pageX, y1: touchPoint.pageY, target: touchPoint.target};
            },
            enable: function () {
                if (this.disabled) {
                    if (this.$disableOverlay) {
                        this.$disableOverlay.remove();
                        this.$disableOverlay = null;
                    }
                    this.disabled = false;
                }
            },
            getClosestMenu: function (elm) {
                var $closestMenu = $(elm).closest('ul');
                while ($closestMenu.dataSM('in-mega')) {
                    $closestMenu = $closestMenu.parent().closest('ul');
                }
                return $closestMenu[0] || null;
            },
            getHeight: function ($elm) {
                return this.getOffset($elm, true);
            },
            // returns precise width/height float values
            getOffset: function ($elm, height) {
                var old;
                if ($elm.css('display') == 'none') {
                    old = {position: $elm[0].style.position, visibility: $elm[0].style.visibility};
                    $elm.css({position: 'absolute', visibility: 'hidden'}).show();
                }
                var box = $elm[0].getBoundingClientRect && $elm[0].getBoundingClientRect(),
                    val = box && (height ? box.height || box.bottom - box.top : box.width || box.right - box.left);
                if (!val && val !== 0) {
                    val = height ? $elm[0].offsetHeight : $elm[0].offsetWidth;
                }
                if (old) {
                    $elm.hide().css(old);
                }
                return val;
            },
            getStartZIndex: function (root) {
                var zIndex = parseInt(this[root ? '$root' : '$firstSub'].css('z-index'));
                if (!root && isNaN(zIndex)) {
                    zIndex = parseInt(this.$root.css('z-index'));
                }
                return !isNaN(zIndex) ? zIndex : 1;
            },
            getTouchPoint: function (e) {
                return e.touches && e.touches[0] || e.changedTouches && e.changedTouches[0] || e;
            },
            getViewport: function (height) {
                var name = height ? 'Height' : 'Width',
                    val = document.documentElement['client' + name],
                    val2 = window['inner' + name];
                if (val2) {
                    val = Math.min(val, val2);
                }
                return val;
            },
            getViewportHeight: function () {
                return this.getViewport(true);
            },
            getViewportWidth: function () {
                return this.getViewport();
            },
            getWidth: function ($elm) {
                return this.getOffset($elm);
            },
            handleEvents: function () {
                return !this.disabled && this.isCSSOn();
            },
            handleItemEvents: function ($a) {
                return this.handleEvents() && !this.isLinkInMegaMenu($a);
            },
            isCollapsible: function () {
                return this.$firstSub.css('position') == 'static';
            },
            isCSSOn: function () {
                return this.$firstLink.css('display') == 'block';
            },
            isFixed: function () {
                var isFixed = this.$root.css('position') == 'fixed';
                if (!isFixed) {
                    this.$root.parentsUntil('body').each(function () {
                        if ($(this).css('position') == 'fixed') {
                            isFixed = true;
                            return false;
                        }
                    });
                }
                return isFixed;
            },
            isLinkInMegaMenu: function ($a) {
                return $(this.getClosestMenu($a[0])).hasClass('mega-menu');
            },
            isTouchMode: function () {
                return !mouse || this.opts.noMouseOver || this.isCollapsible();
            },
            itemActivate: function ($a, focus) {
                var $ul = $a.closest('ul'),
                    level = $ul.dataSM('level');
                // if for some reason the parent item is not activated (e.g. this is an API call to activate the item), activate all parent items first
                if (level > 1 && (!this.activatedItems[level - 2] || this.activatedItems[level - 2][0] != $ul.dataSM('parent-a')[0])) {
                    var self = this;
                    $($ul.parentsUntil('[data-smartmenus-id]', 'ul').get().reverse()).add($ul).each(function () {
                        self.itemActivate($(this).dataSM('parent-a'));
                    });
                }
                // hide any visible deeper level sub menus
                if (!this.isCollapsible() || focus) {
                    this.menuHideSubMenus(!this.activatedItems[level - 1] || this.activatedItems[level - 1][0] != $a[0] ? level - 1 : level);
                }
                // save new active item for this level
                this.activatedItems[level - 1] = $a;
                if (this.$root.triggerHandler('activate.smapi', $a[0]) === false) {
                    return;
                }
                // show the sub menu if this item has one
                var $sub = $a.dataSM('sub');
                if ($sub && (this.isTouchMode() || (!this.opts.showOnClick || this.clickActivated))) {
                    this.menuShow($sub);
                }
            },
            itemBlur: function (e) {
                var $a = $(e.currentTarget);
                if (!this.handleItemEvents($a)) {
                    return;
                }
                this.$root.triggerHandler('blur.smapi', $a[0]);
            },
            itemClick: function (e) {
                var $a = $(e.currentTarget);
                if (!this.handleItemEvents($a)) {
                    return;
                }
                if (this.$touchScrollingSub && this.$touchScrollingSub[0] == $a.closest('ul')[0]) {
                    this.$touchScrollingSub = null;
                    e.stopPropagation();
                    return false;
                }
                if (this.$root.triggerHandler('click.smapi', $a[0]) === false) {
                    return false;
                }
                var subArrowClicked = $(e.target).is('span.sub-arrow'),
                    $sub = $a.dataSM('sub'),
                    firstLevelSub = $sub ? $sub.dataSM('level') == 2 : false;
                // if the sub is not visible
                if ($sub && !$sub.is(':visible')) {
                    if (this.opts.showOnClick && firstLevelSub) {
                        this.clickActivated = true;
                    }
                    // try to activate the item and show the sub
                    this.itemActivate($a);
                    // if "itemActivate" showed the sub, prevent the click so that the link is not loaded
                    // if it couldn't show it, then the sub menus are disabled with an !important declaration (e.g. via mobile styles) so let the link get loaded
                    if ($sub.is(':visible')) {
                        this.focusActivated = true;
                        return false;
                    }
                } else if (this.isCollapsible() && subArrowClicked) {
                    this.itemActivate($a);
                    this.menuHide($sub);
                    return false;
                }
                if (this.opts.showOnClick && firstLevelSub || $a.hasClass('disabled') || this.$root.triggerHandler('select.smapi', $a[0]) === false) {
                    return false;
                }
            },
            itemDown: function (e) {
                var $a = $(e.currentTarget);
                if (!this.handleItemEvents($a)) {
                    return;
                }
                $a.dataSM('mousedown', true);
            },
            itemEnter: function (e) {
                var $a = $(e.currentTarget);
                if (!this.handleItemEvents($a)) {
                    return;
                }
                if (!this.isTouchMode()) {
                    if (this.showTimeout) {
                        clearTimeout(this.showTimeout);
                        this.showTimeout = 0;
                    }
                    var self = this;
                    this.showTimeout = setTimeout(function () {
                        self.itemActivate($a);
                    }, this.opts.showOnClick && $a.closest('ul').dataSM('level') == 1 ? 1 : this.opts.showTimeout);
                }
                this.$root.triggerHandler('mouseenter.smapi', $a[0]);
            },
            itemFocus: function (e) {
                var $a = $(e.currentTarget);
                if (!this.handleItemEvents($a)) {
                    return;
                }
                // fix (the mousedown check): in some browsers a tap/click produces consecutive focus + click events so we don't need to activate the item on focus
                if (this.focusActivated && (!this.isTouchMode() || !$a.dataSM('mousedown')) && (!this.activatedItems.length || this.activatedItems[this.activatedItems.length - 1][0] != $a[0])) {
                    this.itemActivate($a, true);
                }
                this.$root.triggerHandler('focus.smapi', $a[0]);
            },
            itemLeave: function (e) {
                var $a = $(e.currentTarget);
                if (!this.handleItemEvents($a)) {
                    return;
                }
                if (!this.isTouchMode()) {
                    $a[0].blur();
                    if (this.showTimeout) {
                        clearTimeout(this.showTimeout);
                        this.showTimeout = 0;
                    }
                }
                $a.removeDataSM('mousedown');
                this.$root.triggerHandler('mouseleave.smapi', $a[0]);
            },
            menuHide: function ($sub) {
                if (this.$root.triggerHandler('beforehide.smapi', $sub[0]) === false) {
                    return;
                }
                $sub.stop(true, true);
                if ($sub.css('display') != 'none') {
                    var complete = function () {
                        // unset z-index
                        $sub.css('z-index', '');
                    };
                    // if sub is collapsible (mobile view)
                    if (this.isCollapsible()) {
                        if (this.opts.collapsibleHideFunction) {
                            this.opts.collapsibleHideFunction.call(this, $sub, complete);
                        } else {
                            $sub.hide(this.opts.collapsibleHideDuration, complete);
                        }
                    } else {
                        if (this.opts.hideFunction) {
                            this.opts.hideFunction.call(this, $sub, complete);
                        } else {
                            $sub.hide(this.opts.hideDuration, complete);
                        }
                    }
                    // remove IE iframe shim
                    if ($sub.dataSM('ie-shim')) {
                        $sub.dataSM('ie-shim').remove().css({'-webkit-transform': '', transform: ''});
                    }
                    // deactivate scrolling if it is activated for this sub
                    if ($sub.dataSM('scroll')) {
                        this.menuScrollStop($sub);
                        $sub.css({'touch-action': '', '-ms-touch-action': '', '-webkit-transform': '', transform: ''})
                            .unbind('.smartmenus_scroll').removeDataSM('scroll').dataSM('scroll-arrows').hide();
                    }
                    // unhighlight parent item + accessibility
                    $sub.dataSM('parent-a').removeClass('highlighted').attr('aria-expanded', 'false');
                    $sub.attr({
                        'aria-expanded': 'false',
                        'aria-hidden': 'true'
                    });
                    var level = $sub.dataSM('level');
                    this.activatedItems.splice(level - 1, 1);
                    this.visibleSubMenus.splice($.inArray($sub, this.visibleSubMenus), 1);
                    this.$root.triggerHandler('hide.smapi', $sub[0]);
                }
            },
            menuHideAll: function () {
                if (this.showTimeout) {
                    clearTimeout(this.showTimeout);
                    this.showTimeout = 0;
                }
                // hide all subs
                // if it's a popup, this.visibleSubMenus[0] is the root UL
                var level = this.opts.isPopup ? 1 : 0;
                for (var i = this.visibleSubMenus.length - 1; i >= level; i--) {
                    this.menuHide(this.visibleSubMenus[i]);
                }
                // hide root if it's popup
                if (this.opts.isPopup) {
                    this.$root.stop(true, true);
                    if (this.$root.is(':visible')) {
                        if (this.opts.hideFunction) {
                            this.opts.hideFunction.call(this, this.$root);
                        } else {
                            this.$root.hide(this.opts.hideDuration);
                        }
                        // remove IE iframe shim
                        if (this.$root.dataSM('ie-shim')) {
                            this.$root.dataSM('ie-shim').remove();
                        }
                    }
                }
                this.activatedItems = [];
                this.visibleSubMenus = [];
                this.clickActivated = false;
                this.focusActivated = false;
                // reset z-index increment
                this.zIndexInc = 0;
                this.$root.triggerHandler('hideAll.smapi');
            },
            menuHideSubMenus: function (level) {
                for (var i = this.activatedItems.length - 1; i >= level; i--) {
                    var $sub = this.activatedItems[i].dataSM('sub');
                    if ($sub) {
                        this.menuHide($sub);
                    }
                }
            },
            menuIframeShim: function ($ul) {
                // create iframe shim for the menu
                if (IE && this.opts.overlapControlsInIE && !$ul.dataSM('ie-shim')) {
                    $ul.dataSM('ie-shim', $('<iframe/>').attr({src: 'javascript:0', tabindex: -9})
                        .css({position: 'absolute', top: 'auto', left: '0', opacity: 0, border: '0'})
                    );
                }
            },
            menuInit: function ($ul) {
                if (!$ul.dataSM('in-mega')) {
                    // mark UL's in mega drop downs (if any) so we can neglect them
                    if ($ul.hasClass('mega-menu')) {
                        $ul.find('ul').dataSM('in-mega', true);
                    }
                    // get level (much faster than, for example, using parentsUntil)
                    var level = 2,
                        par = $ul[0];
                    while ((par = par.parentNode.parentNode) != this.$root[0]) {
                        level++;
                    }
                    // cache stuff for quick access
                    var $a = $ul.prevAll('a').eq(-1);
                    // if the link is nested (e.g. in a heading)
                    if (!$a.length) {
                        $a = $ul.prevAll().find('a').eq(-1);
                    }
                    $a.addClass('has-submenu').dataSM('sub', $ul);
                    $ul.dataSM('parent-a', $a)
                        .dataSM('level', level)
                        .parent().dataSM('sub', $ul);
                    // accessibility
                    var aId = $a.attr('id') || this.accessIdPrefix + (++this.idInc),
                        ulId = $ul.attr('id') || this.accessIdPrefix + (++this.idInc);
                    $a.attr({
                        id: aId,
                        'aria-haspopup': 'true',
                        'aria-controls': ulId,
                        'aria-expanded': 'false'
                    });
                    $ul.attr({
                        id: ulId,
                        'role': 'group',
                        'aria-hidden': 'true',
                        'aria-labelledby': aId,
                        'aria-expanded': 'false'
                    });
                    // add sub indicator to parent item
                    if (this.opts.subIndicators) {
                        $a[this.opts.subIndicatorsPos](this.$subArrow.clone());
                    }
                }
            },
            menuPosition: function ($sub) {
                var $a = $sub.dataSM('parent-a'),
                    $li = $a.closest('li'),
                    $ul = $li.parent(),
                    level = $sub.dataSM('level'),
                    subW = this.getWidth($sub),
                    subH = this.getHeight($sub),
                    itemOffset = $a.offset(),
                    itemX = itemOffset.left,
                    itemY = itemOffset.top,
                    itemW = this.getWidth($a),
                    itemH = this.getHeight($a),
                    $win = $(window),
                    winX = $win.scrollLeft(),
                    winY = $win.scrollTop(),
                    winW = this.getViewportWidth(),
                    winH = this.getViewportHeight(),
                    horizontalParent = $ul.parent().is('[data-sm-horizontal-sub]') || level == 2 && !$ul.hasClass('sm-vertical'),
                    rightToLeft = this.opts.rightToLeftSubMenus && !$li.is('[data-sm-reverse]') || !this.opts.rightToLeftSubMenus && $li.is('[data-sm-reverse]'),
                    subOffsetX = level == 2 ? this.opts.mainMenuSubOffsetX : this.opts.subMenusSubOffsetX,
                    subOffsetY = level == 2 ? this.opts.mainMenuSubOffsetY : this.opts.subMenusSubOffsetY,
                    x, y;
                if (horizontalParent) {
                    x = rightToLeft ? itemW - subW - subOffsetX : subOffsetX;
                    y = this.opts.bottomToTopSubMenus ? -subH - subOffsetY : itemH + subOffsetY;
                } else {
                    x = rightToLeft ? subOffsetX - subW : itemW - subOffsetX;
                    y = this.opts.bottomToTopSubMenus ? itemH - subOffsetY - subH : subOffsetY;
                }
                if (this.opts.keepInViewport) {
                    var absX = itemX + x,
                        absY = itemY + y;
                    if (rightToLeft && absX < winX) {
                        x = horizontalParent ? winX - absX + x : itemW - subOffsetX;
                    } else if (!rightToLeft && absX + subW > winX + winW) {
                        x = horizontalParent ? winX + winW - subW - absX + x : subOffsetX - subW;
                    }
                    if (!horizontalParent) {
                        if (subH < winH && absY + subH > winY + winH) {
                            y += winY + winH - subH - absY;
                        } else if (subH >= winH || absY < winY) {
                            y += winY - absY;
                        }
                    }
                    // do we need scrolling?
                    // 0.49 used for better precision when dealing with float values
                    if (horizontalParent && (absY + subH > winY + winH + 0.49 || absY < winY) || !horizontalParent && subH > winH + 0.49) {
                        var self = this;
                        if (!$sub.dataSM('scroll-arrows')) {
                            $sub.dataSM('scroll-arrows', $([$('<span class="scroll-up"><span class="scroll-up-arrow"></span></span>')[0], $('<span class="scroll-down"><span class="scroll-down-arrow"></span></span>')[0]])
                                .bind({
                                    mouseenter: function () {
                                        $sub.dataSM('scroll').up = $(this).hasClass('scroll-up');
                                        self.menuScroll($sub);
                                    },
                                    mouseleave: function (e) {
                                        self.menuScrollStop($sub);
                                        self.menuScrollOut($sub, e);
                                    },
                                    'mousewheel DOMMouseScroll': function (e) {
                                        e.preventDefault();
                                    }
                                })
                                .insertAfter($sub)
                            );
                        }
                        // bind scroll events and save scroll data for this sub
                        var eNS = '.smartmenus_scroll';
                        $sub.dataSM('scroll', {
                            y: this.cssTransforms3d ? 0 : y - itemH,
                            step: 1,
                            // cache stuff for faster recalcs later
                            itemH: itemH,
                            subH: subH,
                            arrowDownH: this.getHeight($sub.dataSM('scroll-arrows').eq(1))
                        })
                            .bind(getEventsNS([
                                ['mouseover', function (e) {
                                    self.menuScrollOver($sub, e);
                                }],
                                ['mouseout', function (e) {
                                    self.menuScrollOut($sub, e);
                                }],
                                ['mousewheel DOMMouseScroll', function (e) {
                                    self.menuScrollMousewheel($sub, e);
                                }]
                            ], eNS))
                            .dataSM('scroll-arrows').css({
                            top: 'auto',
                            left: '0',
                            marginLeft: x + (parseInt($sub.css('border-left-width')) || 0),
                            width: subW - (parseInt($sub.css('border-left-width')) || 0) - (parseInt($sub.css('border-right-width')) || 0),
                            zIndex: $sub.css('z-index')
                        })
                            .eq(horizontalParent && this.opts.bottomToTopSubMenus ? 0 : 1).show();
                        // when a menu tree is fixed positioned we allow scrolling via touch too
                        // since there is no other way to access such long sub menus if no mouse is present
                        if (this.isFixed()) {
                            $sub.css({'touch-action': 'none', '-ms-touch-action': 'none'})
                                .bind(getEventsNS([
                                    [touchEvents ? 'touchstart touchmove touchend' : 'pointerdown pointermove pointerup MSPointerDown MSPointerMove MSPointerUp', function (e) {
                                        self.menuScrollTouch($sub, e);
                                    }]
                                ], eNS));
                        }
                    }
                }
                $sub.css({top: 'auto', left: '0', marginLeft: x, marginTop: y - itemH});
                // IE iframe shim
                this.menuIframeShim($sub);
                if ($sub.dataSM('ie-shim')) {
                    $sub.dataSM('ie-shim').css({
                        zIndex: $sub.css('z-index'),
                        width: subW,
                        height: subH,
                        marginLeft: x,
                        marginTop: y - itemH
                    });
                }
            },
            menuScroll: function ($sub, once, step) {
                var data = $sub.dataSM('scroll'),
                    $arrows = $sub.dataSM('scroll-arrows'),
                    end = data.up ? data.upEnd : data.downEnd,
                    diff;
                if (!once && data.momentum) {
                    data.momentum *= 0.92;
                    diff = data.momentum;
                    if (diff < 0.5) {
                        this.menuScrollStop($sub);
                        return;
                    }
                } else {
                    diff = step || (once || !this.opts.scrollAccelerate ? this.opts.scrollStep : Math.floor(data.step));
                }
                // hide any visible deeper level sub menus
                var level = $sub.dataSM('level');
                if (this.activatedItems[level - 1] && this.activatedItems[level - 1].dataSM('sub') && this.activatedItems[level - 1].dataSM('sub').is(':visible')) {
                    this.menuHideSubMenus(level - 1);
                }
                data.y = data.up && end <= data.y || !data.up && end >= data.y ? data.y : (Math.abs(end - data.y) > diff ? data.y + (data.up ? diff : -diff) : end);
                $sub.add($sub.dataSM('ie-shim')).css(this.cssTransforms3d ? {
                    '-webkit-transform': 'translate3d(0, ' + data.y + 'px, 0)',
                    transform: 'translate3d(0, ' + data.y + 'px, 0)'
                } : {marginTop: data.y});
                // show opposite arrow if appropriate
                if (mouse && (data.up && data.y > data.downEnd || !data.up && data.y < data.upEnd)) {
                    $arrows.eq(data.up ? 1 : 0).show();
                }
                // if we've reached the end
                if (data.y == end) {
                    if (mouse) {
                        $arrows.eq(data.up ? 0 : 1).hide();
                    }
                    this.menuScrollStop($sub);
                } else if (!once) {
                    if (this.opts.scrollAccelerate && data.step < this.opts.scrollStep) {
                        data.step += 0.2;
                    }
                    var self = this;
                    this.scrollTimeout = requestAnimationFrame(function () {
                        self.menuScroll($sub);
                    });
                }
            },
            menuScrollMousewheel: function ($sub, e) {
                if (this.getClosestMenu(e.target) == $sub[0]) {
                    e = e.originalEvent;
                    var up = (e.wheelDelta || -e.detail) > 0;
                    if ($sub.dataSM('scroll-arrows').eq(up ? 0 : 1).is(':visible')) {
                        $sub.dataSM('scroll').up = up;
                        this.menuScroll($sub, true);
                    }
                }
                e.preventDefault();
            },
            menuScrollOut: function ($sub, e) {
                if (mouse) {
                    if (!/^scroll-(up|down)/.test((e.relatedTarget || '').className) && ($sub[0] != e.relatedTarget && !$.contains($sub[0], e.relatedTarget) || this.getClosestMenu(e.relatedTarget) != $sub[0])) {
                        $sub.dataSM('scroll-arrows').css('visibility', 'hidden');
                    }
                }
            },
            menuScrollOver: function ($sub, e) {
                if (mouse) {
                    if (!/^scroll-(up|down)/.test(e.target.className) && this.getClosestMenu(e.target) == $sub[0]) {
                        this.menuScrollRefreshData($sub);
                        var data = $sub.dataSM('scroll'),
                            upEnd = $(window).scrollTop() - $sub.dataSM('parent-a').offset().top - data.itemH;
                        $sub.dataSM('scroll-arrows').eq(0).css('margin-top', upEnd).end()
                            .eq(1).css('margin-top', upEnd + this.getViewportHeight() - data.arrowDownH).end()
                            .css('visibility', 'visible');
                    }
                }
            },
            menuScrollRefreshData: function ($sub) {
                var data = $sub.dataSM('scroll'),
                    upEnd = $(window).scrollTop() - $sub.dataSM('parent-a').offset().top - data.itemH;
                if (this.cssTransforms3d) {
                    upEnd = -(parseFloat($sub.css('margin-top')) - upEnd);
                }
                $.extend(data, {
                    upEnd: upEnd,
                    downEnd: upEnd + this.getViewportHeight() - data.subH
                });
            },
            menuScrollStop: function ($sub) {
                if (this.scrollTimeout) {
                    cancelAnimationFrame(this.scrollTimeout);
                    this.scrollTimeout = 0;
                    $sub.dataSM('scroll').step = 1;
                    return true;
                }
            },
            menuScrollTouch: function ($sub, e) {
                e = e.originalEvent;
                if (isTouchEvent(e)) {
                    var touchPoint = this.getTouchPoint(e);
                    // neglect event if we touched a visible deeper level sub menu
                    if (this.getClosestMenu(touchPoint.target) == $sub[0]) {
                        var data = $sub.dataSM('scroll');
                        if (/(start|down)$/i.test(e.type)) {
                            if (this.menuScrollStop($sub)) {
                                // if we were scrolling, just stop and don't activate any link on the first touch
                                e.preventDefault();
                                this.$touchScrollingSub = $sub;
                            } else {
                                this.$touchScrollingSub = null;
                            }
                            // update scroll data since the user might have zoomed, etc.
                            this.menuScrollRefreshData($sub);
                            // extend it with the touch properties
                            $.extend(data, {
                                touchStartY: touchPoint.pageY,
                                touchStartTime: e.timeStamp
                            });
                        } else if (/move$/i.test(e.type)) {
                            var prevY = data.touchY !== undefined ? data.touchY : data.touchStartY;
                            if (prevY !== undefined && prevY != touchPoint.pageY) {
                                this.$touchScrollingSub = $sub;
                                var up = prevY < touchPoint.pageY;
                                // changed direction? reset...
                                if (data.up !== undefined && data.up != up) {
                                    $.extend(data, {
                                        touchStartY: touchPoint.pageY,
                                        touchStartTime: e.timeStamp
                                    });
                                }
                                $.extend(data, {
                                    up: up,
                                    touchY: touchPoint.pageY
                                });
                                this.menuScroll($sub, true, Math.abs(touchPoint.pageY - prevY));
                            }
                            e.preventDefault();
                        } else { // touchend/pointerup
                            if (data.touchY !== undefined) {
                                if (data.momentum = Math.pow(Math.abs(touchPoint.pageY - data.touchStartY) / (e.timeStamp - data.touchStartTime), 2) * 15) {
                                    this.menuScrollStop($sub);
                                    this.menuScroll($sub);
                                    e.preventDefault();
                                }
                                delete data.touchY;
                            }
                        }
                    }
                }
            },
            menuShow: function ($sub) {
                if (!$sub.dataSM('beforefirstshowfired')) {
                    $sub.dataSM('beforefirstshowfired', true);
                    if (this.$root.triggerHandler('beforefirstshow.smapi', $sub[0]) === false) {
                        return;
                    }
                }
                if (this.$root.triggerHandler('beforeshow.smapi', $sub[0]) === false) {
                    return;
                }
                $sub.dataSM('shown-before', true)
                    .stop(true, true);
                if (!$sub.is(':visible')) {
                    // highlight parent item
                    var $a = $sub.dataSM('parent-a');
                    if (this.opts.keepHighlighted || this.isCollapsible()) {
                        $a.addClass('highlighted');
                    }
                    if (this.isCollapsible()) {
                        $sub.removeClass('sm-nowrap').css({
                            zIndex: '',
                            width: 'auto',
                            minWidth: '',
                            maxWidth: '',
                            top: '',
                            left: '',
                            marginLeft: '',
                            marginTop: ''
                        });
                    } else {
                        // set z-index
                        $sub.css('z-index', this.zIndexInc = (this.zIndexInc || this.getStartZIndex()) + 1);
                        // min/max-width fix - no way to rely purely on CSS as all UL's are nested
                        if (this.opts.subMenusMinWidth || this.opts.subMenusMaxWidth) {
                            $sub.css({width: 'auto', minWidth: '', maxWidth: ''}).addClass('sm-nowrap');
                            if (this.opts.subMenusMinWidth) {
                                $sub.css('min-width', this.opts.subMenusMinWidth);
                            }
                            if (this.opts.subMenusMaxWidth) {
                                var noMaxWidth = this.getWidth($sub);
                                $sub.css('max-width', this.opts.subMenusMaxWidth);
                                if (noMaxWidth > this.getWidth($sub)) {
                                    $sub.removeClass('sm-nowrap').css('width', this.opts.subMenusMaxWidth);
                                }
                            }
                        }
                        this.menuPosition($sub);
                        // insert IE iframe shim
                        if ($sub.dataSM('ie-shim')) {
                            $sub.dataSM('ie-shim').insertBefore($sub);
                        }
                    }
                    var complete = function () {
                        // fix: "overflow: hidden;" is not reset on animation complete in jQuery < 1.9.0 in Chrome when global "box-sizing: border-box;" is used
                        $sub.css('overflow', '');
                    };
                    // if sub is collapsible (mobile view)
                    if (this.isCollapsible()) {
                        if (this.opts.collapsibleShowFunction) {
                            this.opts.collapsibleShowFunction.call(this, $sub, complete);
                        } else {
                            $sub.show(this.opts.collapsibleShowDuration, complete);
                        }
                    } else {
                        if (this.opts.showFunction) {
                            this.opts.showFunction.call(this, $sub, complete);
                        } else {
                            $sub.show(this.opts.showDuration, complete);
                        }
                    }
                    // accessibility
                    $a.attr('aria-expanded', 'true');
                    $sub.attr({
                        'aria-expanded': 'true',
                        'aria-hidden': 'false'
                    });
                    // store sub menu in visible array
                    this.visibleSubMenus.push($sub);
                    this.$root.triggerHandler('show.smapi', $sub[0]);
                }
            },
            popupHide: function (noHideTimeout) {
                if (this.hideTimeout) {
                    clearTimeout(this.hideTimeout);
                    this.hideTimeout = 0;
                }
                var self = this;
                this.hideTimeout = setTimeout(function () {
                    self.menuHideAll();
                }, noHideTimeout ? 1 : this.opts.hideTimeout);
            },
            popupShow: function (left, top) {
                if (!this.opts.isPopup) {
                    alert('SmartMenus jQuery Error:\n\nIf you want to show this menu via the "popupShow" method, set the isPopup:true option.');
                    return;
                }
                if (this.hideTimeout) {
                    clearTimeout(this.hideTimeout);
                    this.hideTimeout = 0;
                }
                this.$root.dataSM('shown-before', true)
                    .stop(true, true);
                if (!this.$root.is(':visible')) {
                    this.$root.css({left: left, top: top});
                    // IE iframe shim
                    this.menuIframeShim(this.$root);
                    if (this.$root.dataSM('ie-shim')) {
                        this.$root.dataSM('ie-shim').css({
                            zIndex: this.$root.css('z-index'),
                            width: this.getWidth(this.$root),
                            height: this.getHeight(this.$root),
                            left: left,
                            top: top
                        }).insertBefore(this.$root);
                    }
                    // show menu
                    var self = this,
                        complete = function () {
                            self.$root.css('overflow', '');
                        };
                    if (this.opts.showFunction) {
                        this.opts.showFunction.call(this, this.$root, complete);
                    } else {
                        this.$root.show(this.opts.showDuration, complete);
                    }
                    this.visibleSubMenus[0] = this.$root;
                }
            },
            refresh: function () {
                this.destroy(true);
                this.init(true);
            },
            rootKeyDown: function (e) {
                if (!this.handleEvents()) {
                    return;
                }
                switch (e.keyCode) {
                    case 27: // reset on Esc
                        var $activeTopItem = this.activatedItems[0];
                        if ($activeTopItem) {
                            this.menuHideAll();
                            $activeTopItem[0].focus();
                            var $sub = $activeTopItem.dataSM('sub');
                            if ($sub) {
                                this.menuHide($sub);
                            }
                        }
                        break;
                    case 32: // activate item's sub on Space
                        var $target = $(e.target);
                        if ($target.is('a') && this.handleItemEvents($target)) {
                            var $sub = $target.dataSM('sub');
                            if ($sub && !$sub.is(':visible')) {
                                this.itemClick({currentTarget: e.target});
                                e.preventDefault();
                            }
                        }
                        break;
                }
            },
            rootOut: function (e) {
                if (!this.handleEvents() || this.isTouchMode() || e.target == this.$root[0]) {
                    return;
                }
                if (this.hideTimeout) {
                    clearTimeout(this.hideTimeout);
                    this.hideTimeout = 0;
                }
                if (!this.opts.showOnClick || !this.opts.hideOnClick) {
                    var self = this;
                    this.hideTimeout = setTimeout(function () {
                        self.menuHideAll();
                    }, this.opts.hideTimeout);
                }
            },
            rootOver: function (e) {
                if (!this.handleEvents() || this.isTouchMode() || e.target == this.$root[0]) {
                    return;
                }
                if (this.hideTimeout) {
                    clearTimeout(this.hideTimeout);
                    this.hideTimeout = 0;
                }
            },
            winResize: function (e) {
                if (!this.handleEvents()) {
                    // we still need to resize the disable overlay if it's visible
                    if (this.$disableOverlay) {
                        var pos = this.$root.offset();
                        this.$disableOverlay.css({
                            top: pos.top,
                            left: pos.left,
                            width: this.$root.outerWidth(),
                            height: this.$root.outerHeight()
                        });
                    }
                    return;
                }
                // hide sub menus on resize - on mobile do it only on orientation change
                if (!('onorientationchange' in window) || e.type == 'orientationchange') {
                    var isCollapsible = this.isCollapsible();
                    // if it was collapsible before resize and still is, don't do it
                    if (!(this.wasCollapsible && isCollapsible)) {
                        if (this.activatedItems.length) {
                            this.activatedItems[this.activatedItems.length - 1][0].blur();
                        }
                        this.menuHideAll();
                    }
                    this.wasCollapsible = isCollapsible;
                }
            }
        }
    });

    $.fn.dataSM = function (key, val) {
        if (val) {
            return this.data(key + '_smartmenus', val);
        }
        return this.data(key + '_smartmenus');
    };

    $.fn.removeDataSM = function (key) {
        return this.removeData(key + '_smartmenus');
    };

    $.fn.smartmenus = function (options) {
        if (typeof options == 'string') {
            var args = arguments,
                method = options;
            Array.prototype.shift.call(args);
            return this.each(function () {
                var smartmenus = $(this).data('smartmenus');
                if (smartmenus && smartmenus[method]) {
                    smartmenus[method].apply(smartmenus, args);
                }
            });
        }
        // [data-sm-options] attribute on the root UL
        var dataOpts = this.data('sm-options') || null;
        if (dataOpts) {
            try {
                dataOpts = eval('(' + dataOpts + ')');
            } catch (e) {
                dataOpts = null;
                alert('ERROR\n\nSmartMenus jQuery init:\nInvalid "data-sm-options" attribute value syntax.');
            }
            ;
        }
        return this.each(function () {
            new $.SmartMenus(this, $.extend({}, $.fn.smartmenus.defaults, options, dataOpts));
        });
    };

    // default settings
    $.fn.smartmenus.defaults = {
        isPopup: false,		// is this a popup menu (can be shown via the popupShow/popupHide methods) or a permanent menu bar
        mainMenuSubOffsetX: 0,		// pixels offset from default position
        mainMenuSubOffsetY: 0,		// pixels offset from default position
        subMenusSubOffsetX: 0,		// pixels offset from default position
        subMenusSubOffsetY: 0,		// pixels offset from default position
        subMenusMinWidth: '10em',		// min-width for the sub menus (any CSS unit) - if set, the fixed width set in CSS will be ignored
        subMenusMaxWidth: '20em',		// max-width for the sub menus (any CSS unit) - if set, the fixed width set in CSS will be ignored
        subIndicators: true,		// create sub menu indicators - creates a SPAN and inserts it in the A
        subIndicatorsPos: 'prepend',	// position of the SPAN relative to the menu item content ('prepend', 'append')
        subIndicatorsText: '+',		// [optionally] add text in the SPAN (e.g. '+') (you may want to check the CSS for the sub indicators too)
        scrollStep: 30,		// pixels step when scrolling long sub menus that do not fit in the viewport height
        scrollAccelerate: true,		// accelerate scrolling or use a fixed step
        showTimeout: 250,		// timeout before showing the sub menus
        hideTimeout: 500,		// timeout before hiding the sub menus
        showDuration: 0,		// duration for show animation - set to 0 for no animation - matters only if showFunction:null
        showFunction: null,		// custom function to use when showing a sub menu (the default is the jQuery 'show')
        // don't forget to call complete() at the end of whatever you do
        // e.g.: function($ul, complete) { $ul.fadeIn(250, complete); }
        hideDuration: 0,		// duration for hide animation - set to 0 for no animation - matters only if hideFunction:null
        hideFunction: function ($ul, complete) {
            $ul.fadeOut(200, complete);
        },	// custom function to use when hiding a sub menu (the default is the jQuery 'hide')
        // don't forget to call complete() at the end of whatever you do
        // e.g.: function($ul, complete) { $ul.fadeOut(250, complete); }
        collapsibleShowDuration: 0,		// duration for show animation for collapsible sub menus - matters only if collapsibleShowFunction:null
        collapsibleShowFunction: function ($ul, complete) {
            $ul.slideDown(200, complete);
        },	// custom function to use when showing a collapsible sub menu
        // (i.e. when mobile styles are used to make the sub menus collapsible)
        collapsibleHideDuration: 0,		// duration for hide animation for collapsible sub menus - matters only if collapsibleHideFunction:null
        collapsibleHideFunction: function ($ul, complete) {
            $ul.slideUp(200, complete);
        },	// custom function to use when hiding a collapsible sub menu
        // (i.e. when mobile styles are used to make the sub menus collapsible)
        showOnClick: false,		// show the first-level sub menus onclick instead of onmouseover (i.e. mimic desktop app menus) (matters only for mouse input)
        hideOnClick: true,		// hide the sub menus on click/tap anywhere on the page
        noMouseOver: false,		// disable sub menus activation onmouseover (i.e. behave like in touch mode - use just mouse clicks) (matters only for mouse input)
        keepInViewport: true,		// reposition the sub menus if needed to make sure they always appear inside the viewport
        keepHighlighted: true,		// keep all ancestor items of the current sub menu highlighted (adds the 'highlighted' class to the A's)
        markCurrentItem: false,		// automatically add the 'current' class to the A element of the item linking to the current URL
        markCurrentTree: true,		// add the 'current' class also to the A elements of all ancestor items of the current item
        rightToLeftSubMenus: false,		// right to left display of the sub menus (check the CSS for the sub indicators' position)
        bottomToTopSubMenus: false,		// bottom to top display of the sub menus
        overlapControlsInIE: true		// make sure sub menus appear on top of special OS controls in IE (i.e. SELECT, OBJECT, EMBED, etc.)
    };

    return $;
}));
jQuery(document).ready(function ($) {

    $(function () {
        $('#main-menu').smartmenus({
            subMenusSubOffsetX: 1,
            subMenusSubOffsetY: -8
        });
    });

});
/*
 _ _      _       _
 ___| (_) ___| | __  (_)___
 / __| | |/ __| |/ /  | / __|
 \__ \ | | (__|   < _ | \__ \
 |___/_|_|\___|_|\_(_)/ |___/
 |__/

 Version: 1.6.0
 Author: Ken Wheeler
 Website: http://kenwheeler.github.io
 Docs: http://kenwheeler.github.io/slick
 Repo: http://github.com/kenwheeler/slick
 Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */

/*

 Since we are adding this js to our theme, I am adding the small jQuery
 call to "turn it on" with the class='slick-slider' to the bottom of this file
 so look down!

 */


(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function ($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function () {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this, dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="Previous" tabindex="0" role="button">Previous</button>',
                nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function (slider, i) {
                    return $('<button type="button" data-role="none" role="button" tabindex="0" />').text(i + 1);
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnFocus: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.focussed = false;
            _.interrupted = false;
            _.hidden = 'hidden';
            _.paused = true;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, settings, dataSettings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


            _.registerBreakpoints();
            _.init(true);

        }

        return Slick;

    }());

    Slick.prototype.activateADA = function () {
        var _ = this;

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });

    };

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof(index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function (index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateHeight = function () {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function (targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -(_.currentLeft);
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function (now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                                now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                                now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function () {
                        if (callback) {
                            callback.call();
                        }
                    }
                });

            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function () {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.getNavTarget = function () {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if (asNavFor && asNavFor !== null) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        return asNavFor;

    };

    Slick.prototype.asNavFor = function (index) {

        var _ = this,
            asNavFor = _.getNavTarget();

        if (asNavFor !== null && typeof asNavFor === 'object') {
            asNavFor.each(function () {
                var target = $(this).slick('getSlick');
                if (!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }

    };

    Slick.prototype.applyTransition = function (slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function () {

        var _ = this;

        _.autoPlayClear();

        if (_.slideCount > _.options.slidesToShow) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed);
        }

    };

    Slick.prototype.autoPlayClear = function () {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function () {

        var _ = this,
            slideTo = _.currentSlide + _.options.slidesToScroll;

        if (!_.paused && !_.interrupted && !_.focussed) {

            if (_.options.infinite === false) {

                if (_.direction === 1 && ( _.currentSlide + 1 ) === ( _.slideCount - 1 )) {
                    _.direction = 0;
                }

                else if (_.direction === 0) {

                    slideTo = _.currentSlide - _.options.slidesToScroll;

                    if (_.currentSlide - 1 === 0) {
                        _.direction = 1;
                    }

                }

            }

            _.slideHandler(slideTo);

        }

    };

    Slick.prototype.buildArrows = function () {

        var _ = this;

        if (_.options.arrows === true) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if (_.slideCount > _.options.slidesToShow) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow
                        .addClass('slick-disabled')
                        .attr('aria-disabled', 'true');
                }

            } else {

                _.$prevArrow.add(_.$nextArrow)

                    .addClass('slick-hidden')
                    .attr({
                        'aria-disabled': 'true',
                        'tabindex': '-1'
                    });

            }

        }

    };

    Slick.prototype.buildDots = function () {

        var _ = this,
            i, dot;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$slider.addClass('slick-dotted');

            dot = $('<ul />').addClass(_.options.dotsClass);

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
            }

            _.$dots = dot.appendTo(_.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active').attr('aria-hidden', 'false');

        }

    };

    Slick.prototype.buildOut = function () {

        var _ = this;

        _.$slides =
            _.$slider
                .children(_.options.slide + ':not(.slick-cloned)')
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function (index, element) {
            $(element)
                .attr('data-slick-index', index)
                .data('originalStyling', $(element).attr('style') || '');
        });

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div aria-live="polite" class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();


        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.buildRows = function () {

        var _ = this, a, b, c, newSlides, numOfSlides, originalSlides, slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if (_.options.rows > 1) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(
                originalSlides.length / slidesPerSection
            );

            for (a = 0; a < numOfSlides; a++) {
                var slide = document.createElement('div');
                for (b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for (c = 0; c < _.options.slidesPerRow; c++) {
                        var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.empty().append(newSlides);
            _.$slider.children().children().children()
                .css({
                    'width': (100 / _.options.slidesPerRow) + '%',
                    'display': 'inline-block'
                });

        }

    };

    Slick.prototype.checkResponsive = function (initial, forceUpdate) {

        var _ = this,
            breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if (_.options.responsive &&
            _.options.responsive.length &&
            _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                                _.breakpointSettings[
                                    targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings,
                            _.breakpointSettings[
                                targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if (!initial && triggerBreakpoint !== false) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }

    };

    Slick.prototype.changeSlide = function (event, dontAnimate) {

        var _ = this,
            $target = $(event.currentTarget),
            indexOffset, slideOffset, unevenOffset;

        // If target is a link, prevent default action.
        if ($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if (!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                    event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }

    };

    Slick.prototype.checkNavigable = function (index) {

        var _ = this,
            navigables, prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function () {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots)
                .off('click.slick', _.changeSlide)
                .off('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .off('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

        _.$slider.off('focus.slick blur.slick');

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.cleanUpSlideEvents();

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).off('ready.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.cleanUpSlideEvents = function () {

        var _ = this;

        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));

    };

    Slick.prototype.cleanUpRows = function () {

        var _ = this, originalSlides;

        if (_.options.rows > 1) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.empty().append(originalSlides);
        }

    };

    Slick.prototype.clickHandler = function (event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }

    };

    Slick.prototype.destroy = function (refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }


        if (_.$prevArrow && _.$prevArrow.length) {

            _.$prevArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display', '');

            if (_.htmlExpr.test(_.options.prevArrow)) {
                _.$prevArrow.remove();
            }
        }

        if (_.$nextArrow && _.$nextArrow.length) {

            _.$nextArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display', '');

            if (_.htmlExpr.test(_.options.nextArrow)) {
                _.$nextArrow.remove();
            }

        }


        if (_.$slides) {

            _.$slides
                .removeClass('slick-slide slick-active slick-center slick-visible slick-current')
                .removeAttr('aria-hidden')
                .removeAttr('data-slick-index')
                .each(function () {
                    $(this).attr('style', $(this).data('originalStyling'));
                });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');
        _.$slider.removeClass('slick-dotted');

        _.unslicked = true;

        if (!refresh) {
            _.$slider.trigger('destroy', [_]);
        }

    };

    Slick.prototype.disableTransition = function (slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function (slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function () {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.fadeSlideOut = function (slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });

        }

    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {

        var _ = this;

        if (filter !== null) {

            _.$slidesCache = _.$slides;

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.focusHandler = function () {

        var _ = this;

        _.$slider
            .off('focus.slick blur.slick')
            .on('focus.slick blur.slick',
                '*:not(.slick-arrow)', function (event) {

                    event.stopImmediatePropagation();
                    var $sf = $(this);

                    setTimeout(function () {

                        if (_.options.pauseOnFocus) {
                            _.focussed = $sf.is(':focus');
                            _.autoPlay();
                        }

                    }, 0);

                });
    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {

        var _ = this;
        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function () {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else if (!_.options.asNavFor) {
            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
        } else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;

    };

    Slick.prototype.getLeft = function (slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                verticalOffset = (verticalHeight * _.options.slidesToShow) * -1;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
                        verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;
                    } else {
                        _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;
                        verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;
                verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            if (_.options.rtl === true) {
                if (targetSlide[0]) {
                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                } else {
                    targetLeft = 0;
                }
            } else {
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            }

            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }

                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft = 0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }

                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {

        var _ = this;

        return _.options[option];

    };

    Slick.prototype.getNavigableIndexes = function () {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;

    };

    Slick.prototype.getSlick = function () {

        return this;

    };

    Slick.prototype.getSlideCount = function () {

        var _ = this,
            slidesTraversed, swipedSlide, centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function (index, slide) {
                if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;

        } else {
            return _.options.slidesToScroll;
        }

    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);

    };

    Slick.prototype.init = function (creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
            _.checkResponsive(true);
            _.focusHandler();

        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

        if (_.options.autoplay) {

            _.paused = false;
            _.autoPlay();

        }

    };

    Slick.prototype.initADA = function () {
        var _ = this;
        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        _.$slideTrack.attr('role', 'listbox');

        _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function (i) {
            $(this).attr({
                'role': 'option',
                'aria-describedby': 'slick-slide' + _.instanceUid + i + ''
            });
        });

        if (_.$dots !== null) {
            _.$dots.attr('role', 'tablist').find('li').each(function (i) {
                $(this).attr({
                    'role': 'presentation',
                    'aria-selected': 'false',
                    'aria-controls': 'navigation' + _.instanceUid + i + '',
                    'id': 'slick-slide' + _.instanceUid + i + ''
                });
            })
                .first().attr('aria-selected', 'true').end()
                .find('button').attr('role', 'button').end()
                .closest('div').attr('role', 'toolbar');
        }
        _.activateADA();

    };

    Slick.prototype.initArrowEvents = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow
                .off('click.slick')
                .on('click.slick', {
                    message: 'previous'
                }, _.changeSlide);
            _.$nextArrow
                .off('click.slick')
                .on('click.slick', {
                    message: 'next'
                }, _.changeSlide);
        }

    };

    Slick.prototype.initDotEvents = function () {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true) {

            $('li', _.$dots)
                .on('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initSlideEvents = function () {

        var _ = this;

        if (_.options.pauseOnHover) {

            _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
            _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initializeEvents = function () {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();
        _.initSlideEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.initUI = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

    };

    Slick.prototype.keyHandler = function (event) {

        var _ = this;
        //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if (!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'next' : 'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'previous' : 'next'
                    }
                });
            }
        }

    };

    Slick.prototype.lazyLoad = function () {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        function loadImages(imagesScope) {

            $('img[data-lazy]', imagesScope).each(function () {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function () {

                    image
                        .animate({opacity: 0}, 100, function () {
                            image
                                .attr('src', imageSource)
                                .animate({opacity: 1}, 200, function () {
                                    image
                                        .removeAttr('data-lazy')
                                        .removeClass('slick-loading');
                                });
                            _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                        });

                };

                imageToLoad.onerror = function () {

                    image
                        .removeAttr('data-lazy')
                        .removeClass('slick-loading')
                        .addClass('slick-lazyload-error');

                    _.$slider.trigger('lazyLoadError', [_, image, imageSource]);

                };

                imageToLoad.src = imageSource;

            });

        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }

    };

    Slick.prototype.loadSlider = function () {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.next = Slick.prototype.slickNext = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });

    };

    Slick.prototype.orientationChange = function () {

        var _ = this;

        _.checkResponsive();
        _.setPosition();

    };

    Slick.prototype.pause = Slick.prototype.slickPause = function () {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;

    };

    Slick.prototype.play = Slick.prototype.slickPlay = function () {

        var _ = this;

        _.autoPlay();
        _.options.autoplay = true;
        _.paused = false;
        _.focussed = false;
        _.interrupted = false;

    };

    Slick.prototype.postSlide = function (index) {

        var _ = this;

        if (!_.unslicked) {

            _.$slider.trigger('afterChange', [_, index]);

            _.animating = false;

            _.setPosition();

            _.swipeLeft = null;

            if (_.options.autoplay) {
                _.autoPlay();
            }

            if (_.options.accessibility === true) {
                _.initADA();
            }

        }

    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });

    };

    Slick.prototype.preventDefault = function (event) {

        event.preventDefault();

    };

    Slick.prototype.progressiveLazyLoad = function (tryCount) {

        tryCount = tryCount || 1;

        var _ = this,
            $imgsToLoad = $('img[data-lazy]', _.$slider),
            image,
            imageSource,
            imageToLoad;

        if ($imgsToLoad.length) {

            image = $imgsToLoad.first();
            imageSource = image.attr('data-lazy');
            imageToLoad = document.createElement('img');

            imageToLoad.onload = function () {

                image
                    .attr('src', imageSource)
                    .removeAttr('data-lazy')
                    .removeClass('slick-loading');

                if (_.options.adaptiveHeight === true) {
                    _.setPosition();
                }

                _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                _.progressiveLazyLoad();

            };

            imageToLoad.onerror = function () {

                if (tryCount < 3) {

                    /**
                     * try to load the image 3 times,
                     * leave a slight delay so we don't get
                     * servers blocking the request.
                     */
                    setTimeout(function () {
                        _.progressiveLazyLoad(tryCount + 1);
                    }, 500);

                } else {

                    image
                        .removeAttr('data-lazy')
                        .removeClass('slick-loading')
                        .addClass('slick-lazyload-error');

                    _.$slider.trigger('lazyLoadError', [_, image, imageSource]);

                    _.progressiveLazyLoad();

                }

            };

            imageToLoad.src = imageSource;

        } else {

            _.$slider.trigger('allImagesLoaded', [_]);

        }

    };

    Slick.prototype.refresh = function (initializing) {

        var _ = this, currentSlide, lastVisibleIndex;

        lastVisibleIndex = _.slideCount - _.options.slidesToShow;

        // in non-infinite sliders, we don't want to go past the
        // last visible index.
        if (!_.options.infinite && ( _.currentSlide > lastVisibleIndex )) {
            _.currentSlide = lastVisibleIndex;
        }

        // if less slides than to show, go to start.
        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;

        }

        currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, {currentSlide: currentSlide});

        _.init();

        if (!initializing) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);

        }

    };

    Slick.prototype.registerBreakpoints = function () {

        var _ = this, breakpoint, currentBreakpoint, l,
            responsiveSettings = _.options.responsive || null;

        if ($.type(responsiveSettings) === 'array' && responsiveSettings.length) {

            _.respondTo = _.options.respondTo || 'window';

            for (breakpoint in responsiveSettings) {

                l = _.breakpoints.length - 1;
                currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while (l >= 0) {
                        if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
                            _.breakpoints.splice(l, 1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;

                }

            }

            _.breakpoints.sort(function (a, b) {
                return ( _.options.mobileFirst ) ? a - b : b - a;
            });

        }

    };

    Slick.prototype.reinit = function () {

        var _ = this;

        _.$slides =
            _.$slideTrack
                .children(_.options.slide)
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.cleanUpSlideEvents();
        _.initSlideEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        _.setPosition();
        _.focusHandler();

        _.paused = !_.options.autoplay;
        _.autoPlay();

        _.$slider.trigger('reInit', [_]);

    };

    Slick.prototype.resize = function () {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function () {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if (!_.unslicked) {
                    _.setPosition();
                }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function (position) {

        var _ = this,
            positionProps = {},
            x, y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function () {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function () {

        var _ = this,
            targetLeft;

        _.$slides.each(function (index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });

    };

    Slick.prototype.setHeight = function () {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setOption =
        Slick.prototype.slickSetOption = function () {

            /**
             * accepts arguments in format of:
             *
             *  - for changing a single option's value:
             *     .slick("setOption", option, value, refresh )
             *
             *  - for changing a set of responsive options:
             *     .slick("setOption", 'responsive', [{}, ...], refresh )
             *
             *  - for updating multiple values at once (not responsive)
             *     .slick("setOption", { 'option': value, ... }, refresh )
             */

            var _ = this, l, item, option, value, refresh = false, type;

            if ($.type(arguments[0]) === 'object') {

                option = arguments[0];
                refresh = arguments[1];
                type = 'multiple';

            } else if ($.type(arguments[0]) === 'string') {

                option = arguments[0];
                value = arguments[1];
                refresh = arguments[2];

                if (arguments[0] === 'responsive' && $.type(arguments[1]) === 'array') {

                    type = 'responsive';

                } else if (typeof arguments[1] !== 'undefined') {

                    type = 'single';

                }

            }

            if (type === 'single') {

                _.options[option] = value;


            } else if (type === 'multiple') {

                $.each(option, function (opt, val) {

                    _.options[opt] = val;

                });


            } else if (type === 'responsive') {

                for (item in value) {

                    if ($.type(_.options.responsive) !== 'array') {

                        _.options.responsive = [value[item]];

                    } else {

                        l = _.options.responsive.length - 1;

                        // loop through the responsive object and splice out duplicates.
                        while (l >= 0) {

                            if (_.options.responsive[l].breakpoint === value[item].breakpoint) {

                                _.options.responsive.splice(l, 1);

                            }

                            l--;

                        }

                        _.options.responsive.push(value[item]);

                    }

                }

            }

            if (refresh) {

                _.unload();
                _.reinit();

            }

        };

    Slick.prototype.setPosition = function () {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);

    };

    Slick.prototype.setProps = function () {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
            bodyStyle.MozTransition !== undefined ||
            bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if (_.options.fade) {
            if (typeof _.options.zIndex === 'number') {
                if (_.options.zIndex < 3) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);
    };


    Slick.prototype.setSlideClasses = function (index) {

        var _ = this,
            centerOffset, allSlides, indexOffset, remainder;

        allSlides = _.$slider
            .find('.slick-slide')
            .removeClass('slick-active slick-center slick-current')
            .attr('aria-hidden', 'true');

        _.$slides
            .eq(index)
            .addClass('slick-current');

        if (_.options.centerMode === true) {

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {

                    _.$slides
                        .slice(index - centerOffset, index + centerOffset + 1)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides
                        .slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

                if (index === 0) {

                    allSlides
                        .eq(allSlides.length - 1 - _.options.slidesToShow)
                        .addClass('slick-center');

                } else if (index === _.slideCount - 1) {

                    allSlides
                        .eq(_.options.slidesToShow)
                        .addClass('slick-center');

                }

            }

            _.$slides
                .eq(index)
                .addClass('slick-center');

        } else {

            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {

                _.$slides
                    .slice(index, index + _.options.slidesToShow)
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {

                    allSlides
                        .slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    allSlides
                        .slice(indexOffset, indexOffset + _.options.slidesToShow)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

            }

        }

        if (_.options.lazyLoad === 'ondemand') {
            _.lazyLoad();
        }

    };

    Slick.prototype.setupInfinite = function () {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex - _.slideCount)
                        .prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex + _.slideCount)
                        .appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.interrupt = function (toggle) {

        var _ = this;

        if (!toggle) {
            _.autoPlay();
        }
        _.interrupted = toggle;

    };

    Slick.prototype.selectHandler = function (event) {

        var _ = this;

        var targetElement =
            $(event.target).is('.slick-slide') ?
                $(event.target) :
                $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.setSlideClasses(index);
            _.asNavFor(index);
            return;

        }

        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function (index, sync, dontAnimate) {

        var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
            _ = this, navTarget;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if (_.options.autoplay) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        if (_.options.asNavFor) {

            navTarget = _.getNavTarget();
            navTarget = navTarget.slick('getSlick');

            if (navTarget.slideCount <= navTarget.options.slidesToShow) {
                navTarget.setSlideClasses(_.currentSlide);
            }

        }

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function () {
                    _.postSlide(animSlide);
                });

            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true) {
            _.animateSlide(targetLeft, function () {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }

    };

    Slick.prototype.startLoad = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function () {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return (_.options.rtl === false ? 'right' : 'left');
        }
        if (_.options.verticalSwiping === true) {
            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                return 'down';
            } else {
                return 'up';
            }
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function (event) {

        var _ = this,
            slideCount,
            direction;

        _.dragging = false;
        _.interrupted = false;
        _.shouldClick = ( _.touchObject.swipeLength > 10 ) ? false : true;

        if (_.touchObject.curX === undefined) {
            return false;
        }

        if (_.touchObject.edgeHit === true) {
            _.$slider.trigger('edge', [_, _.swipeDirection()]);
        }

        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {

            direction = _.swipeDirection();

            switch (direction) {

                case 'left':
                case 'down':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable(_.currentSlide + _.getSlideCount()) :
                            _.currentSlide + _.getSlideCount();

                    _.currentDirection = 0;

                    break;

                case 'right':
                case 'up':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable(_.currentSlide - _.getSlideCount()) :
                            _.currentSlide - _.getSlideCount();

                    _.currentDirection = 1;

                    break;

                default:


            }

            if (direction != 'vertical') {

                _.slideHandler(slideCount);
                _.touchObject = {};
                _.$slider.trigger('swipe', [_, direction]);

            }

        } else {

            if (_.touchObject.startX !== _.touchObject.curX) {

                _.slideHandler(_.currentSlide);
                _.touchObject = {};

            }

        }

    };

    Slick.prototype.swipeHandler = function (event) {

        var _ = this;

        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
                .touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options
                    .touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function (event) {

        var _ = this,
            edgeWasHit = false,
            curLeft, swipeDirection, swipeLength, positionOffset, touches;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = Math.round(Math.sqrt(
                Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));
        }

        swipeDirection = _.swipeDirection();

        if (swipeDirection === 'vertical') {
            return;
        }

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }


        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function (event) {

        var _ = this,
            touches;

        _.interrupted = true;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function () {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides
            .removeClass('slick-slide slick-active slick-visible slick-current')
            .attr('aria-hidden', 'true')
            .css('width', '');

    };

    Slick.prototype.unslick = function (fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();

    };

    Slick.prototype.updateArrows = function () {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if (_.options.arrows === true &&
            _.slideCount > _.options.slidesToShow &&
            !_.options.infinite) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            }

        }

    };

    Slick.prototype.updateDots = function () {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots
                .find('li')
                .removeClass('slick-active')
                .attr('aria-hidden', 'true');

            _.$dots
                .find('li')
                .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
                .addClass('slick-active')
                .attr('aria-hidden', 'false');

        }

    };

    Slick.prototype.visibility = function () {

        var _ = this;

        if (_.options.autoplay) {

            if (document[_.hidden]) {

                _.interrupted = true;

            } else {

                _.interrupted = false;

            }

        }

    };

    $.fn.slick = function () {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].slick = new Slick(_[i], opt);
            else
                ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));

jQuery(document).ready(function ($) {
    $('.sc-slider').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        fade: false,
        cssEase: 'linear',
        autoplay: true,
        autoplaySpeed: 6000,
        /*        responsive: [
         {
         breakpoint: 900,
         settings: 'unslick',

         }
         ]*/
    });
});

/*!
 Shoelace.css tabs {version}
 (c) A Beautiful Site, LLC

 Released under the MIT license
 Source: https://github.com/claviska/shoelace-css
 */
//
// This script is required to make tabs interactive. Before loading it, you must include either
// jQuery or Zepto. You can load them locally or via CDN. You only need one.
//
// jQuery via CDN (34.6KB)
//
//   <script
//     src="https://code.jquery.com/jquery-3.2.1.min.js"
//     integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="
//     crossorigin="anonymous"></script>
//
// Zepto via CDN (9.7KB)
//
//   <script src="https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.min.js"></script>
//
// Tabs not toggling?
//   - Make sure you've loaded jQuery or Zepto before this script
//   - Make sure your tabs are structured properly per the docs
//   - Make sure your tab navs and tab panes have the correct IDs
//
(function () {
    /* eslint-env browser, jquery */
    /* global Zepto */
    'use strict';

    if (typeof jQuery === 'undefined' && typeof Zepto === 'undefined') {
        throw new Error('Shoelace tabs require either jQuery or Zepto.');
    } else {
        (window.jQuery || window.Zepto)(function ($) {
            // Watch for clicks on tabs
            $(document).on('click', '.tabs-nav a', function (event) {
                var tabs = $(this).closest('.tabs');
                var tabNav = this;
                var selectedPane = $(tabs).find(tabNav.hash).get(0);

                event.preventDefault();

                // Ignore tabs without an href or with the "disabled" class
                if (!tabNav.hash || $(tabNav).is('.disabled')) {
                    return;
                }

                // Make the selected tab active
                $(tabNav).siblings().removeClass('active');
                $(tabNav).addClass('active');

                // Hide active tab panes that aren't getting selected
                $(tabs).find('.tabs-pane.active').not(selectedPane).each(function () {
                    $(this).removeClass('active');
                    $(tabs).trigger('hide', this);
                });

                // Show the selected tab pane
                if (selectedPane && !$(selectedPane).is('.active')) {
                    $(selectedPane).addClass('active');
                    $(tabs).trigger('show', selectedPane);
                }
            });
        });
    }
})();
