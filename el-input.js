import Vue from 'vue';

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
            let { arg } = binding;
            if (arg === 'currency') return;

            if (checkEmpty(e.target.value, e)) return;

            let value = parseFloat(e.target.value || 0).toFixed(binding.arg || 2);
            e.target.value = value;
            vnode.data.model.callback(value);
        });
    }
});

const isLastPoint = (str) => str.indexOf('.') === str.length - 1;

// 提供一个dataset属性,判断当时input是否有内容
// 添加class，兼容v-validatorSubmit
const checkEmpty = (str, e) => {
    let isEmpty = Number(str) === 0;
    let cls = ['empty-msg-input-border'];

    if (isEmpty) {
        e.target.setAttribute('data-_null', true);
        e.target.parentNode.classList.add(...cls);
    } else {
        e.target.removeAttribute('data-_null');
        e.target.parentNode.classList.remove(...cls);
    }
    return isEmpty;
};

const matchValue = (str, len = 2) => {
    let reg = new RegExp(`^\\d+(?:\\.\\d{1,${len}})?`);

    // 正则检测会将“3.”强行转化为“3”，因此这里增加一个判断，原则是应该是兼容正则处理的
    if (isLastPoint(str)) {
        return str;
    } else {
        let result = str.match(reg);
        return result ? result[0] : '';
    }
};

const matchCurrency = (str) => {
    let result = str.match(/^[A-Z]+/);
    return result ? result[0] : '';
};

function handler (e, binding) {
    let targeValue = e.target.value;
    let result = '';
    let { value, arg } = binding;

    if (arg === 'currency') {
        result = matchCurrency(targeValue);
    } else {
        result = value ? value(targeValue) : matchValue(targeValue, arg); // 默认是限制两位金额小数，可通过v-input-limit=“fn”, 传入自定义处理函数
    }

    checkEmpty(result, e);

    return result;
}

export function checkLimitInputEmpty (vm) {
    let context = vm;
    let element = context.$el.querySelector('input[data-_null]');
    if (element) {
        context.$message.error(i18n.t('Tips.check_input_empty'));
        return true;
    }
    return false;
}
