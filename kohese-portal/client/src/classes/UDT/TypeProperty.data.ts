

export let TypePropertyData = {
  name : {
    type : 'text',
    template : `<label class="center-block">Name:
                <p> Hello World </p>
                  <input class="form-control" formControlName="name">
                </label>`,
    required : true,
    default : '',
    propertyName : 'name'
  },
  description : {
    type : 'text',
    template : `<label> Description:
                  <input formControlName="description">
                </label>`,
    required : false,
    default : '',
    propertyName : 'description'
  }
}
