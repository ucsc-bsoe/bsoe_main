# We use slick slider to create sliders.

More info at: http://kenwheeler.github.io/slick/

Very simple markup:

```
<div class="slick-slider">
  <div>your content</div>
  <div>your content</div>
  <div>your content</div>
</div>
```

Very simple jQuery (this is already added to the bottom of slick.js):
```
jQuery(document).ready(function($){
    $('.sc-slider').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        fade: true,
        cssEase: 'linear'
    });
});
```

Slick default css and js are already loaded as part of the theme.
