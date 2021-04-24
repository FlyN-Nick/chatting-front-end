import React, { Component } from 'react';

/** Shows user's endorsement level. */
 class EndorsementLevelText extends Component
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
