const { createApp } = Vue;

function isNumeric(str) {
    if (typeof str != "string") return false;
    return !isNaN(str) && !isNaN(parseFloat(str));
}

const trimLeadingZeroes = (text) => text.replace(/^0+/, "");
const trimLeadingPluses = (text) => text.replace(/^\++/, "");
const removeNonNumeric = (text) => text.replace(/\D/g, "");
const removeBlanks = (text) => text.replace(/\s/g, "");
const removeParentheses = (text) => text.replace(/[\(\)]/g, "");

createApp({
    data() {
        return {
            rawTel: "44 (759) 000 1122",
            tooltip: "",
            tooltipTimeout: null,
        };
    },
    computed: {
        telWithoutBlanks() {
            return removeBlanks(this.rawTel);
        },
        telNormalized() {
            return trimLeadingZeroes(removeNonNumeric(this.rawTel));
        },
        wa() {
            return "https://api.whatsapp.com/send?phone=" + this.telNormalized;
        },
        wa2() {
            return "https://wa.me/" + this.telNormalized;
        },
        tg() {
            return "https://t.me/" + this.telWithoutBlanks;
        },
        sg() {
            return "https://signal.me/#p/+" + this.telNormalized;
        },
        skype() {
            if (isNumeric(removeParentheses(this.telWithoutBlanks))) {
                return "skype:+" + this.telNormalized + "?call";
            } else {
                return "skype:" + this.telWithoutBlanks + "?chat";
            }
        },
    },
    methods: {
        async clipboard(value) {
            console.log(value);
            await navigator.clipboard.writeText(value);
        },
        setTooltip(text) {
            if (this.tooltipTimeout) {
                clearTimeout(this.tooltipTimeout);
                this.tooltipTimeout = null;
            }
            this.tooltip = text;
            this.tooltipTimeout = setTimeout(() => (this.tooltip = ""), 3000);
        },
        activatePressTooltip() {
            this.setTooltip("Click to copy");
        },
        activateCopiedTooltip() {
            this.setTooltip("Copied");
        },
        async copyHandler(id) {
            this.activateCopiedTooltip();
            await this.clipboard(id);
        },
    },
}).mount("#app");
