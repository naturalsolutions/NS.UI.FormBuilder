define([
    'vue',
    'text!./editionPageModule/templates/OnBlurPage.html'
], function(Vue, tpl) {
    return {
        init: function(el) {
            el.innerHTML = tpl;
            return new Vue({
                el: el,
                data: function() {
                    return {
                        message: 'vincent'
                    }
                },
                methods: {
                    onBtnClick: function(name) {
                        this.id = "test"
                        this.message = name;
                        this.$emit('complete', name);
                    }
                },
                mounted: function() {
                    console.log('mounted');
                },
                destroyed: function() {
                    console.log('destroyed');
                }
            })
        }
    }
});