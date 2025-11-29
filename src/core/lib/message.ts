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
