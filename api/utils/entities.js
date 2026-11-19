/*
Soft delete on grid
{
  name: "soft_delete_record",
  icon: "trash",
  iconClass: "svg_red"
}*/

const entities= {
  users:{
    title:"Users",
    singular:"User",
    layout: {
      type: "grid",
      showHeader: true,
      columns: [
        {
          id: 1,
          name: "createdAt",
          alias: "created at",
          type: "date",
          width: "",
          visible: false,
          sort: true,
          filter: true,
          filter_type: "date"
        },
        {
          id: 2,
          name: "createdAtParsed",
          alias: "created at",
          type: "field",
          width: "",
          visible: true,
          sort: true,
          filter: false
        },
        {
          id: 3,
          name: "name",
          type: "field",
          width: "",
          visible: true,
          sort: true,
          filter: true,
          filter_type: "text"
        },
        {
          id: 4,
          name: "email",
          type: "field",
          width: "",
          visible: true,
          sort: true,
          filter: true,
          filter_type: "text"
        },
        {
          id: 5,
          name: "role_name",
          alias: "role",
          type: "field",
          width: "",
          visible: true,
          sort: true,
          filter: true,
          filter_field_name: "role_id",
          filter_type: "multipicker",
          filter_entity: "roles"
        },
        {
          id: 6,
          name: "role_id",
          nestedName: "name",
          type: "field",
          width: "120px",
          visible: false,
          sort: false,
          filter: false,
        },
        {
          id: 7,
          name: "Actions",
          type: "actions",
          width: "120px",
          sort: false,
          visible: true,
          filter: false,
          actions:[
            {
              name: "modify_record",
              icon: "pencil",
              iconClass: "svg_primary"
            },
          ]
        },
      ]
    },
    form: {
      title: {
        new: "New User",
        edit: "Edit User",
      },
      fields: [
        {
          label: "Name",
          name: "name",
          type: "text",
          onCreate: true,
          onUpdate: true,
          visible: true,
        },
        {
          label: "Email",
          name: "email",
          type: "email",
          onCreate: true,
          onUpdate: true,
          visible: true,
        },
        {
          label: "Role",
          name: "role_id",
          type: "picker",
          entity: "roles",
          onCreate: true,
          onUpdate: true,
          visible: true,
        },
        {
          label: "ID",
          name: "_id",
          type: "text",
          onCreate: true,
          onUpdate: true,
          visible: false,
        },
      ]
    }
  },
  materials:{
    title:"Materials",
    singular:"Material",
    layout: {
      type: "grid",
      showHeader: true,
      showAddNew: false,
      columns: [
        {
          id: 1,
          name: "name",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
        {
          id: 2,
          name: "activity_name",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
        {
          id: 3,
          name: "reference_unit",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
        {
          id: 4,
          name: "reference_amount",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "number"
        },
        {
          id: 5,
          name: "material_unit",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
        {
          id: 6,
          name: "type",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
        {
          id: 6,
          name: "is_solvent",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
        {
          id: 7,
          name: "Actions",
          alias: "Azioni",
          type: "actions",
          width: "120px",
          sort: false,
          visible: true,
          filter: false,
          actions:[
            {
              name: "modify_record",
              icon: "pencil",
              iconClass: "svg_primary xs"
            },
          ]
        },
      ]
    },
    form: {
      title: {
        new: "new_material",
        edit: "edit_material",
      },
      fields: [
        {
          label: "name",
          name: "name",
          type: "text",
          onCreate: true,
          onUpdate: true,
          visible: true
        },
        {
          label: "activity_name",
          name: "activity_name",
          type: "text",
          onCreate: true,
          onUpdate: true,
          visible: true
        },
        {
          label: "lca_reference_unit",
          name: "reference_unit",
          type: "checkbox",
          data: [{label:'kg', value:'kg'}, {label:'g', value:'g'}, {label:'mg', value:'mg'}, {label:'l', value:'l'}, {label:'ml', value:'ml'}],
          onCreate: true,
          onUpdate: true,
          visible: true
        },
        {
          label: "reference_amount",
          name: "reference_amount",
          type: "number",
          onCreate: true,
          onUpdate: true,
          visible: true
        },
        {
          label: "material_unit",
          name: "material_unit",
          type: "checkbox",
          data: [{label:'kg', value:'kg'}, {label:'g', value:'g'}, {label:'mg', value:'mg'}, {label:'l', value:'l'}, {label:'ml', value:'ml'}],
          onCreate: true,
          onUpdate: true,
          visible: true
        },
        {
          label: "type",
          name: "type",
          type: "checkbox",
          data: [
            {label:'items', value:'items'}, 
            {label:'resins', value:'resins'},
            {label:'thickeners', value:'thickeners'},
            {label:'detergents', value:'detergents'},
            {label:'solvents', value:'solvents'},
            {label:'waters', value:'waters'}
          ],
          onCreate: true,
          onUpdate: true,
          visible: true
        },
        {
          label: "ID",
          name: "_id",
          type: "text",
          onCreate: true,
          onUpdate: true,
          visible: false,
        },
         {
          label: "is_solvent",
          name: "is_solvent",
          type: "checkbox",
          data: [{label:'no', value:false}, {label:'yes', value:true}],
          onCreate: true,
          onUpdate: true,
          visible: true
        },
      ]
    }
  },
  roles:{
    title:"Roles",
    singular:"Role",
    layout: {
      type: "grid",
      showHeader: true,
      columns: [
        {
          name: "name",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
      ]
    },
    form: {
      title: {
        new: "New Role",
        update: "Update Role",
      },
      fields: [
        {
          label: "Role",
          name: "name",
          type: "text",
          onCreate: true,
          onUpdate: true,
        }
      ]
    }
  },
  ecoinvent_products:{
    title:"LCA Products",
    singular:"LCA Product",
    layout: {
      type: "grid",
      showHeader: true,
      columns: [
        {
          name: "createdAt",
          alias: "created at",
          type: "date",
          width: "",
          visible: false,
          sort: true,
          filter: true,
          filter_type: "date"
        },
        {
          name: "updatedAt",
          alias: "updated at",
          type: "date",
          width: "",
          visible: false,
          sort: true,
          filter: true,
          filter_type: "date"
        },
        {
          name: "uuid",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
        {
          name: "name",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
        {
          name: "activity_name",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
        {
          name: "geography",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
        {
          name: "reference_unit",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
        {
          name: "reference_amount",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
        {
          name: "physical_state",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
        {
          name: "version",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
        {
          name: "lca_data",
          type: "field",
          width: "",
          sort: true,
          visible: true,
          filter: true,
          filter_type: "text"
        },
      ]
    },
    form: {
      title: {
        new: "New LCA Product",
        update: "Update LCA Product",
      },
      fields: [
        {
          label: "Role",
          name: "name",
          type: "text",
          onCreate: true,
          onUpdate: true,
        }
      ]
    }
  },
}

module.exports = {
  entities
}