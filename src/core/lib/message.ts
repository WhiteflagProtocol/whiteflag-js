/**
 * @module core/message
 * @summary Whiteflag JS message class
 */
export { WfMessage };

/* MODULE DECLARATIONS */
/**
 * Whiteflag Message
 * @class WfMessage
 */
class WfMessage {
    /* CLASS PROPERTIES */
    /**
     * @property {Object} header The message header
     */
    MetaHeader: Object;
    /**
     * @property {Object} header The message header
     */
    MessageHeader: Object;
    /**
     * @property {Array} causes Underlying causes of the error
     */
    MessageBody: Object;

    /* CONSTRUCTOR and STATIC FACTORY METHODS */
    /**
     * Constructor for a Whiteflag message
     * @param version the version of the used Whiteflag specification
     */
    constructor(version: number) {
        this.MetaHeader = {};
        this.MessageHeader = {};
        this.MessageBody = {};
    }
}
