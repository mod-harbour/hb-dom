#include "hbclass.ch"

CLASS Element
    VAR namespace
    VAR prefix
    VAR name
    VAR attributes INIT {}
    VAR children INIT {}

    METHOD New(namespace, prefix, name)
    METHOD NewHtml(name)
ENDCLASS

METHOD New(namespace, prefix, name) CLASS Element
    DO CASE
    CASE namespace == ""
        ::namespace := nil
    CASE ValType(namespace) == "C" .OR. namespace == nil
            ::namespace := namespace
    OTHERWISE
        break nil
    END

    DO CASE
    CASE prefix == ""
        ::prefix := nil
    CASE ValType(prefix) == "C" .OR. prefix == nil
        // TODO: Throw if it doesn't match the regex /^[A-Z_a-z][-.0-9A-Z_a-z]*$/
        ::prefix := prefix
    OTHERWISE
        break nil
    END
    
    // TODO: Throw if it doesn't match the regex /^[:A-Z_a-z][-.0-9:A-Z_a-z]*$/
    if ValType(name) == "C"
        ::name := name
    else
        break nil
    endif

    // Namespace invariants (https://dom.spec.whatwg.org/#validate-and-extract)
    DO CASE
    CASE prefix != nil .AND. namespace == nil
        break nil
    CASE prefix == "xml" .AND. namespace != "http://www.w3.org/XML/1998/namespace"
        break nil
    CASE (name == "xmlns" .OR. prefix == "xmlns") .AND. namespace != "http://www.w3.org/2000/xmlns/"
        break nil
    CASE namespace == "http://www.w3.org/2000/xmlns/" .AND. name != "xmlns" .AND. prefix != "xmlns"
        break nil
    END
    
RETURN Self

METHOD NewHtml(name) CLASS Element
    ::namespace := "http://www.w3.org/1999/xhtml"
    ::prefix := nil
    // TODO: Throw if it doesn't match the regex /^[:A-Z_a-z][-.0-9:A-Z_a-z]*$/
    if ValType(name) == "C"
        ::name := name
    else
        break nil
    endif
RETURN Self

// -----------------------------------------------------------------------------

CLASS Comment
    VAR text

    METHOD New(text)
ENDCLASS

METHOD New(data) CLASS Comment
    if ValType(data) == "C"
        ::data := data
    else
        break nil
    endif
RETURN Self

// -----------------------------------------------------------------------------

CLASS Doctype
    VAR name

    METHOD New(name)
    METHOD NewHtml()
ENDCLASS

METHOD New(name) CLASS Doctype
    if ValType(name) == "C"
        // TODO: Throw if it doesn't match the regex /^[:A-Z_a-z][-.0-9:A-Z_a-z]*$/
        ::name := name
    else
        break nil
    endif
RETURN Self

METHOD NewHtml() CLASS Doctype
    ::name := "html"
RETURN Self

// -----------------------------------------------------------------------------

CLASS Document
    VAR preDoctype INIT {}
    VAR doctype INIT nil
    VAR preElement INIT {}
    VAR element INIT nil
    VAR postElement INIT {}

    METHOD New()
    METHOD NewWith(namespace, prefix, name)
    METHOD NewHtml()
ENDCLASS

METHOD New() CLASS Document
RETURN Self

METHOD NewWith(namespace, prefix, name) CLASS Document
    ::element := Element():New(namespace, prefix, name)
RETURN Self

METHOD NewHtml() CLASS Document
    LOCAL head, body
    ::doctype := Doctype():NewHtml()
    ::element := Element():NewHtml("html")
    head := Element():NewHtml("head")
    body := Element():NewHtml("body")
    ::element:children := {head, body}
RETURN Self