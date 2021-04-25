import React, { Component } from 'react';
import EndorsementLevelTextProp from '../Types/EndorsementLevelTextProp';

/** Shows user's endorsement level. */
 class EndorsementLevelText extends Component<EndorsementLevelTextProp>
 {
   render()
   {
     return (
       <span id="endorsementText">
         <button type="button" className="btn btn-primary">
           <em>Endorsement Level: <strong>{this.props.level}</strong></em>
         </button>
       </span>
     );
   }
 }

 export default EndorsementLevelText;
