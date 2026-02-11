// flow-typed signature: 740504cb8176bc8734d2a62895c6d35d
// flow-typed version: a6edf4ac0b/jsx/flow_>=v0.83.x

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#list_of_global_attributes
 */
declare type jsx$HTMLElement = {
  /**
   * Specifies a shortcut key to activate/focus an element
   */
  accessKey?: string,
  /**
   * Specifies one or more classnames for an element (refers to a class in a style sheet)
   */
  className?: string,
  /**
   * Specifies whether the content of an element is editable or not
   */
  contentEditable?: string,
  /**
   * Specifies meta tag for application testing or querying
   */
  'data-testid'?: string,
  /**
   * Specifies the text direction for the content in an element
   */
  dir?: string,
  /**
   * Specifies whether an element is draggable or not
   */
  draggable?: string,
  /**
   * Specifies that an element is not yet, or is no longer, relevant
   */
  hidden?: boolean | '' | 'hidden' | 'until-found',
  /**
   * Specifies a unique id for an element
   */
  id?: string,
  /**
   * Specify that a standard HTML element should behave like a defined custom
   * built-in element
   * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
   */
  is?: string,
  /**
   * Specifies the language of the element's content
   */
  lang?: string,
  /*
   * Roles define the semantic meaning of content, allowing screen readers and
   * other tools to present and support interaction with an object in a way that
   * is consistent with user expectations of that type of object.
   */
  role?: string,
  /*
   * Assigns a slot in a shadow DOM shadow tree to an element: An element with a
   * slot attribute is assigned to the slot created by the <slot> element whose
   * name attribute's value matches that slot attribute's value.
   */
  slot?: string,
  /**
   * Specifies whether the element is to have its spelling and grammar checked or not
   */
  spellCheck?: string,
  /*
   * Contains CSS styling declarations to be applied to the element.
   */
  style?: { +[string]: string | number, ... },
  /**
   * Specifies the tabbing order of an element
   */
  tabIndex?: string,
  /**
   * Specifies extra information about an element
   */
  title?: string,
  /**
   * Specifies whether the content of an element should be translated or not
   */
  translate?: string,
  ...
};

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types
 */
declare type jsx$HTMLInputElement$Type =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week';

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attributes
 */
declare type jsx$HTMLInputElement = {
  ...jsx$HTMLElement,
  value?: string,
  type?: jsx$HTMLInputElement$Type,
  ...
};

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attributes
 */
declare type jsx$HTMLTextAreaElement = {
  ...jsx$HTMLElement,
  /**
   * This attribute indicates whether the value of the control can be automatically completed by the browser. Possible values are:
   *
   * off: The user must explicitly enter a value into this field for every use, or the document provides its own auto-completion method; the browser does not automatically complete the entry.
   * on: The browser can automatically complete the value based on values that the user has entered during previous uses.
   */
  autoComplete?: 'on' | 'off',
  /**
   * A string which indicates whether or not to activate automatic spelling correction and processing of text substitutions (if any are configured) while the user is editing this textarea. Permitted values are:
   *
   * off: Disable automatic spelling correction and text substitutions.
   * on: Enable automatic spelling correction and text substitutions.
   */
  autoCorrect?: 'on' | 'off',
  /**
   * This Boolean attribute lets you specify that a form control should have input focus when the page loads. Only one form-associated element in a document can have this attribute specified.
   */
  autoFocus?: boolean,
  /**
   * The visible width of the text control, in average character widths. If it is specified, it must be a positive integer. If it is not specified, the default value is 20.
   */
  cols?: number,
  /**
   * This Boolean attribute indicates that the user cannot interact with the control. If this attribute is not specified, the control inherits its setting from the containing element, for example <fieldset>; if there is no containing element when the disabled attribute is set, the control is enabled.
   */
  disabled?: boolean,
  /**
   * The form element that the <textarea> element is associated with (its "form owner"). The value of the attribute must be the id of a form element in the same document. If this attribute is not specified, the <textarea> element must be a descendant of a form element. This attribute enables you to place <textarea> elements anywhere within a document, not just as descendants of form elements.
   */
  form?: string,
  /**
   * The maximum number of characters (UTF-16 code units) that the user can enter. If this value isn't specified, the user can enter an unlimited number of characters.
   */
  maxLength?: number,
  /**
   * The minimum number of characters (UTF-16 code units) required that the user should enter.
   */
  minLength?: number,
  /**
   * The name of the control.
   */
  name?: string,
  /**
   * A hint to the user of what can be entered in the control. Carriage returns or line-feeds within the placeholder text must be treated as line breaks when rendering the hint.
   */
  placeholder?: string,
  /**
   * This Boolean attribute indicates that the user cannot modify the value of the control. Unlike the disabled attribute, the readonly attribute does not prevent the user from clicking or selecting in the control. The value of a read-only control is still submitted with the form.
   */
  readOnly?: boolean,
  /**
   * This attribute specifies that the user must fill in a value before submitting a form.
   */
  required?: boolean,
  /**
   * The number of visible text lines for the control. If it is specified, it must be a positive integer. If it is not specified, the default value is 2.
   */
  rows?: number,
  /**
   * Specifies whether the <textarea> is subject to spell checking by the underlying browser/OS. The value can be:
   *
   * true: Indicates that the element needs to have its spelling and grammar checked.
   * default : Indicates that the element is to act according to a default behavior, possibly based on the parent element's own spellcheck value.
   * false : Indicates that the element should not be spell checked.
   */
  spellCheck?: 'true' | 'default' | 'false',
  /**
   * Indicates how the control wraps text. Possible values are:
   *
   * hard: The browser automatically inserts line breaks (CR+LF) so that each line has no more than the width of the control; the cols attribute must also be specified for this to take effect.
   * soft: The browser ensures that all line breaks in the value consist of a CR+LF pair, but does not insert any additional line breaks.
   * off Non-Standard: Like soft but changes appearance to white-space: pre so line segments exceeding cols are not wrapped and the <textarea> becomes horizontally scrollable.
   *
   * If this attribute is not specified, soft is its default value.
   */
  wrap?: 'hard' | 'soft' | 'off',
  /**
   * React specific : Control the text inside the textarea.
   */
  value?: string,
  /**
   * React specific : Specifies the initial value for a text area.
   */
  defaultValue?: string,
  /**
   * React specific: An Event handler function. Required for controlled text areas. Fires immediately when the input’s value is changed by the user (for example, it fires on every keystroke).
   * Behaves like the browser input event.
   */
  // onChange?: (evt: SyntheticEvent<HTMLTextAreaElement>) => mixed,
  ...
};

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attributes
 */
declare type jsx$HTMLButtonElement = {
  ...jsx$HTMLElement,
  /**
   * This Boolean attribute specifies that the button should have input focus when the page loads. Only one element in a document can have this attribute.
   */
  autoFocus?: boolean,
  /**
   * This Boolean attribute prevents the user from interacting with the button: it cannot be pressed or focused.
   */
  disabled?: boolean,
  /**
   * The <form> element to associate the button with (its form owner). The value of this attribute must be the id of a <form> in the same document. (If this attribute is not set, the <button> is associated with its ancestor <form> element, if any.)
   * This attribute lets you associate <button> elements to <form>s anywhere in the document, not just inside a <form>. It can also override an ancestor <form> element.
   */
  form?: string,
  /**
   * The URL that processes the information submitted by the button. Overrides the action attribute of the button's form owner. Does nothing if there is no form owner.
   */
  formAction?: string,
  /**
   * If the button is a submit button (it's inside/associated with a <form> and doesn't have type="button"), specifies how to encode the form data that is submitted. Possible values:
   *
   * application/x-www-form-urlencoded: The default if the attribute is not used.
   * multipart/form-data: Used to submit <input> elements with their type attributes set to file.
   * text/plain: Specified as a debugging aid; shouldn't be used for real form submission.
   *
   * If this attribute is specified, it overrides the enctype attribute of the button's form owner.
   */
  formEncType?:
    | 'application/x-www-form-urlencoded'
    | 'multipart/form-data'
    | 'text/plain',
  /**
   * If the button is a submit button (it's inside/associated with a <form> and doesn't have type="button"), this attribute specifies the HTTP method used to submit the form. Possible values:
   *
   * post: The data from the form are included in the body of the HTTP request when sent to the server. Use when the form contains information that shouldn't be public, like login credentials.
   * get: The form data are appended to the form's action URL, with a ? as a separator, and the resulting URL is sent to the server. Use this method when the form has no side effects, like search forms.
   *
   * If specified, this attribute overrides the method attribute of the button's form owner.
   */
  formMethod?: 'post' | 'get',
  /**
   * If the button is a submit button, this Boolean attribute specifies that the form is not to be validated when it is submitted. If this attribute is specified, it overrides the novalidate attribute of the button's form owner.
   * This attribute is also available on <input type="image"> and <input type="submit"> elements.
   */
  formNoValidate?: boolean,
  /**
   * If the button is a submit button, this attribute is an author-defined name or standardized, underscore-prefixed keyword indicating where to display the response from submitting the form. This is the name of, or keyword for, a browsing context (a tab, window, or <iframe>). If this attribute is specified, it overrides the target attribute of the button's form owner. The following keywords have special meanings:
   *
   * _self: Load the response into the same browsing context as the current one. This is the default if the attribute is not specified.
   * _blank: Load the response into a new unnamed browsing context — usually a new tab or window, depending on the user's browser settings.
   * _parent: Load the response into the parent browsing context of the current one. If there is no parent, this option behaves the same way as _self.
   * _top: Load the response into the top-level browsing context (that is, the browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this option behaves the same way as _self.
   */
  formTarget?: '_self' | '_blank' | '_parent' | '_top',
  /**
   * The name of the button, submitted as a pair with the button's value as part of the form data, when that button is used to submit the form.
   */
  name?: string,
  /**
   * Turns a <button> element into a popover control button; takes the ID of the popover element to control as its value. See the Popover API landing page for more details.
   */
  popoverTarget?: string,
  /**
   * Specifies the the action to be performed on a popover element being controlled by a control <button>. Possible values are:
   *
   * hide: The button will hide a shown popover. If you try to hide an already hidden popover, no action will be taken.
   * show: The button will show a hidden popover. If you try to show an already showing popover, no action will be taken.
   * toggle: The button will toggle a popover between showing and hidden. If the popover is hidden, it will be shown; if the popover is showing, it will be hidden. If popovertargetaction is omitted, "toggle" is the default action that will be performed by the control button.
   */
  popoverTargetAction?: 'hide' | 'show' | 'toggle',
  /**
   * The default behavior of the button. Possible values are:
   *
   * submit: The button submits the form data to the server. This is the default if the attribute is not specified for buttons associated with a <form>, or if the attribute is an empty or invalid value.
   * reset: The button resets all the controls to their initial values, like <input type="reset">. (This behavior tends to annoy users.)
   * button: The button has no default behavior, and does nothing when pressed by default. It can have client-side scripts listen to the element's events, which are triggered when the events occur.
   */
  type?: 'submit' | 'reset' | 'button',
  /**
   * Defines the value associated with the button's name when it's submitted with the form data. This value is passed to the server in params when the form is submitted using this button.
   */
  value?: string,
  ...
};

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attributes
 */
declare type jsx$HTMLAnchorElement = {
  ...jsx$HTMLElement,
  /**
   * Causes the browser to treat the linked URL as a download. Can be used with or without a filename value:
   *
   * Without a value, the browser will suggest a filename/extension, generated from various sources:
   *  The Content-Disposition HTTP header
   *  The final segment in the URL path
   *  The media type (from the Content-Type header, the start of a data: URL, or Blob.type for a blob: URL)
   * filename: defining a value suggests it as the filename. / and \ characters are converted to underscores (_). Filesystems may forbid other characters in filenames, so browsers will adjust the suggested name if necessary.
   */
  download?: string,
  /**
   * The URL that the hyperlink points to. Links are not restricted to HTTP-based URLs — they can use any URL scheme supported by browsers:
   *
   *  Sections of a page with document fragments
   *  Specific text portions with text fragments
   *  Pieces of media files with media fragments
   *  Telephone numbers with tel: URLs
   *  Email addresses with mailto: URLs
   *  While web browsers may not support other URL schemes, websites can with registerProtocolHandler()
   */
  href?: string,
  /**
   * Hints at the human language of the linked URL. No built-in functionality. Allowed values are the same as the global lang attribute.
   */
  hrefLang?: string,
  /**
   * A space-separated list of URLs. When the link is followed, the browser will send POST requests with the body PING to the URLs. Typically for tracking.
   */
  ping?: string,
  /**
   * How much of the referrer to send when following the link.
   *
   * no-referrer: The Referer header will not be sent.
   * no-referrer-when-downgrade: The Referer header will not be sent to origins without TLS (HTTPS).
   * origin: The sent referrer will be limited to the origin of the referring page: its scheme, host, and port.
   * origin-when-cross-origin: The referrer sent to other origins will be limited to the scheme, the host, and the port. Navigations on the same origin will still include the path.
   * same-origin: A referrer will be sent for same origin, but cross-origin requests will contain no referrer information.
   * strict-origin: Only send the origin of the document as the referrer when the protocol security level stays the same (HTTPS→HTTPS), but don't send it to a less secure destination (HTTPS→HTTP).
   * strict-origin-when-cross-origin (default): Send a full URL when performing a same-origin request, only send the origin when the protocol security level stays the same (HTTPS→HTTPS), and send no header to a less secure destination (HTTPS→HTTP).
   * unsafe-url: The referrer will include the origin and the path (but not the fragment, password, or username). This value is unsafe, because it leaks origins and paths from TLS-protected resources to insecure origins.
   */
  referrerPolicy?:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url',
  /**
   * The relationship of the linked URL as space-separated link types.
   */
  rel?: string,
  /**
   * Where to display the linked URL, as the name for a browsing context (a tab, window, or <iframe>). The following keywords have special meanings for where to load the URL:
   *
   * _self: the current browsing context. (Default)
   * _blank: usually a new tab, but users can configure browsers to open a new window instead.
   * _parent: the parent browsing context of the current one. If no parent, behaves as _self.
   * _top: the topmost browsing context (the "highest" context that's an ancestor of the current one). If no ancestors, behaves as _self.
   */
  target?: '_self' | '_blank' | '_parent' | '_top',
  /**
   * Hints at the linked URL's format with a MIME type. No built-in functionality.
   */
  type?: string,
  ...
};
