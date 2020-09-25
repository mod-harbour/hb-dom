const NAMESPACES = {
    html: "http://www.w3.org/1999/xhtml",
    mathml: "http://www.w3.org/1998/Math/MathML",
    svg: "http://www.w3.org/2000/svg",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/",
    xlink: "http://www.w3.org/1999/xlink"
};
const VOID_ELEMENTS = [
    "area",
    "base",
    "basefont",
    "bgsound",
    "br",
    "col",
    "embed",
    "frame",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
];
const PLAINTEXT_ELEMENTS = [
    "iframe",
    "noembed",
    "noframes",
    "noscript",
    "plaintext",
    "script",
    "style",
    "xmp"
];

class Attr {
    constructor(namespace, prefix, name, value) {
        this.namespace = namespace;
        this.prefix = prefix;
        this.name = name;
        this.value = value;
    }
    render() {
        return this.serializedName() + '="' + this.escapedValue() + '"';
    }
    serializedName() {
        let prefix;
        switch (this.namespace) {
            case null:
                prefix = null;
                break;
            case NAMESPACES.xml:
                prefix = "xml";
                break;
            case NAMESPACES.xmlns:
                prefix = (this.name !== "xmlns") ? "xmlns" : null;
                break;
            case NAMESPACES.xlink:
                prefix = "xlink";
                break;
            default:
                prefix = this.prefix;
        }
        return (prefix === null) ? this.name : (prefix + ":" + this.name);
    }
    escapedValue() {
        return this.value
            .replace(/&/g, "&amp;")
            .replace(/\xA0/g, "&nbsp;")
            .replace(/"/g, "&quot;");
    }
}

class Element {
    constructor(namespace, prefix, name) {
        this.namespace = namespace;
        this.prefix = prefix;
        this.name = name;
        this.attributes = [];
        this.children = [];
        this.indent = 2;
    }
    render() {
        let tagname;
        if ([NAMESPACES.html, NAMESPACES.mathml, NAMESPACE.svg].includes(this.namespace)) {
            tagname = this.name;
        } else {
            tagname = this.prefix + ":" + this.name;
        }
        let ret = "<" + tagname;
        for (const attribute of this.attributes) {
            ret += " " + attribute.render();
        }
        ret += ">";
        if (!this.serializesAsVoid()) {
            ret += this.renderContents();
            ret += "</" + tagname + ">";
        }
        return ret;
    }
    renderContents() {
        let ret = "";
        if (!this.serializesAsVoid()) {
            for (const child of this.children) {
                // TODO: indent
                if (typeof child == "string") {  // Text node
                    if (this.namespace === HTML_NAMESPACE && PLAINTEXT_ELEMENTS.includes(this.name)) {
                        ret += child;
                    } else {
                        ret += escapeText(child);
                    }
                } else {
                    ret += child.render();
                }
            }
        }
        return ret;
    }
    serializesAsVoid() {
        return this.namespace === HTML_NAMESPACE && VOID_ELEMENTS.includes(this.name);
    }
}

class Comment {
    constructor(data) {
        this.data = data;
    }
    render() {
        return "<!--" + this.data + "-->";
    }
}

class Doctype {
    constructor(name, publicId, systemId) {
        this.name = name;
        this.publicId = publicId;
        this.systemId = systemId;
    }
    render() {
        return "<!DOCTYPE " + name + ">";
    }
}

class DocumentFragment {
    constructor() {
        this.children = [];
    }
    render() {
        let ret = "";
        for (const child of this.children) {
            if (typeof child == "string") {
                ret += escapeText(child);
            } else {
                ret += child.render();
            }
        }
        return ret;
    }
}

function escapeText(text) {
    return (
        text
            .replace(/&/g, "&amp;")
            .replace(/\xA0/g, "&nbsp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
    );
}
