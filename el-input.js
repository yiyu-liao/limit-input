import Vue from 'vue';

const isLastPoint = (str) => str.indexOf('.') === str.length - 1;

const regSplice = (str, len = 2) => {
    let reg = new RegExp(`^\\d+(?:\\.\\d{1,${len}})?`);

    // 正则检测会将“3.”强行转化为“3”，因此这里增加一个判断，原则是应该是兼容正则处理的
    if (isLastPoint(str)) {
        return str;
    } else {
        let result = str.match(reg);
        return result ? result[0] : '';
    }
};

function handler (e, binding) {
    let targeValue = e.target.value;
    let result = '';
    let { value, arg } = binding;
    result = value ? value(targeValue) : regSplice(targeValue, arg); // 默认是限制两位金额小数，可通过v-input-limit=“fn”, 传入自定义处理函数

    // 提供一个dataset属性,判断当时input是否有内容
    if (!result) {
        e.target.setAttribute('data-_null', true);
    } else {
        e.target.removeAttribute('data-_null');
    }

    return result;
}

Vue.directive('input-limit', {
    bind (el, binding, vnode) {
        // to do, 可以考虑在此进行格式初始化处理

        const element = el.getElementsByTagName('input')[0];

        element.addEventListener('input', function (e) {
            let value = handler(e, binding);
            e.target.value = value;
            vnode.data.model.callback(value);
        });

        // 失焦自动补全小数点位数
        element.addEventListener('blur', function (e) {
            let value = parseFloat(e.target.value || 0).toFixed(binding.arg || 2);
            e.target.value = value;
            vnode.data.model.callback(value);
        });
    }
});
