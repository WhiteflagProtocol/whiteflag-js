'use strict';
/**
 * @module common/message
 * @summary Whiteflag JS common message definitions module
 */
export {
    WfMsgType
};

/* MODULE DECLARATIONS */
/**
 * Whiteflag message types, defining the types of Whiteflag message
 * as specified by the Whiteflag standard
 * @enum WfFieldType
 * @wfversion v1-draft.7
 * @wfreference 2.4.2.1 Functional Messages, 2.4.2.2 Management Messages
 * 
 */
enum WfMsgType {
    /** Authentication message */
    A = 'A',
    /** Cryptographic support message */
    K = 'K',
    /** Test message */
    T = 'T',
    /** Protection sign */
    P = 'P',
    /** Protection sign */
    D = 'D',
    /** Status signal */
    S = 'S',
    /** Emergency signal */
    E = 'E',
    /** Infrstructure sign */
    I = 'I',
    /** Mission signal */
    M = 'M',
    /** Request signal */
    Q = 'Q',
    /** Reference message */
    R = 'R',
    /** Free text message */
    F = 'F'
}