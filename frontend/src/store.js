import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'



Vue.use(Vuex)


const default_user_settings = {

      studio_box_info: true,
      studio_canvas_size: null,
      studio_right_nav_width: null,
      studio_left_nav_width: 350
    }

// TODO should we use a dic object here for some of user properties?
// ie like you did with ai links?
export const user_module = {
  state: {
    logged_in: false,
    user_name: null,
    is_annotator: null,
    projects: null,
    current: {
      trainer: {},
      api: {},
      email: null,
      security_email_verified: false,
      is_super_admin: false
    },
    current_project_permission_level: null,
    is_typing_or_menu_open: false,
    settings: default_user_settings
	},

	mutations: {
    // TODO get user settings from storage (also TODO create user storage for settings)
		log_in: state => state.logged_in = true,
    log_out(state) {
      state.logged_in = false
      state.user_name = null
      state.is_annotator = null
      state.projects = null
      state.current = {}
      state.is_typing_or_menu_open = false
      state.settings = default_user_settings
    },
    restore_default_user_settings(state) {
      state.settings = default_user_settings
    },
    set_user_name(state, user_name) {
      state.user_name = user_name
    },
    set_is_annotator(state, is_annotator) {
      state.is_annotator = is_annotator
    },
    set_user_projects(state, projects) {
      state.projects = projects
    },
    set_current_user(state, user) {
      state.current = user
    },
    patch_current_user(state, key_value_array) {
      let key = key_value_array[0]
      let value = key_value_array[1]
      state.current[key] = value
    },
    set_user_setting(state, payload) {
      // eg $store.commit('set_user_setting', ['studio_box_info', false])
      // where payload == [key, value]
      // sets 'studio_box_info'key to False
      let key = payload[0]
      let value = payload[1]
      state.settings[key] = value
    },
    set_current_project_permission_level(state, level) {
      state.current_project_permission_level = level
    },
    super_admin_toggle(state) {
      state.current.is_super_admin = !state.current.is_super_admin
    },

    // Context of limiting hotkeys using this info
    // refactored from label name but should probably split menu_open and is_typing!
    set_user_is_typing_or_menu_open(state, bool) {
      state.is_typing_or_menu_open = bool
    }
  },
  actions: {
    // can do ({commit} , payload) => { commit('log_out', payload.something )}
    // if needed

    log_out({commit}) {

      commit('log_out')  // rename to clear_user when possible
      commit('clear_clipboard')
      commit('clear_project')
      commit('clear_ai')
      commit('clear_annotation')
      commit('clear_labels')
      commit('clear_annotation_assignment')
      commit('clear_annotation_project')
      commit('clear_video_current')
      commit('builder_or_trainer_clear')
      commit('clear_alert')
      commit('clear_org')
      commit('clear_job')
      commit('clear_connection')

    },

    reset_project_related_state({commit}) {
      commit('clear_job')
      commit('clear_connection')
      commit('clear_annotation')
    }

  }
}

export const public_project = {
  state: {
    project:{
      project_string_id: undefined
    }
  },
  mutations:{
    set_current_public_project(state, project) {
      state.project = project
    }
  },
  getters:{
    is_on_public_project(state){
      if(state.project.project_string_id){
        return true
      }
      else{
        return false
      }
    }
  }
}
export const project = {

  // TODO merge name and string methods in project
  // TODO clarify why using phrase "current", is it becuase
  // needs some variable can't store in "root" of project?

  state: {
    project_name: null,
    project_string_id: null,

    current_directory: {},

    current: {
      user_primary: {
        username: null
      },
      member_list: []
    }

  },
  mutations: {
    set_project_name(state, project_name) {
      state.project_name = project_name
    },
    set_project_string_id(state, project_string_id) {
      state.project_string_id = project_string_id
    },
    clear_project(state) {
      state.project_name = null,
        state.project_string_id = null,
        // careful to reset dict here
        // otherwise can get "null" issue errors
        state.current = {
          user_primary: {
            username: null
          },
          last_patched_directory: null
        }

      state.current_directory = {}
    },

    set_current_project_member_list(state, member_list) {
      // already in project scope
      state.current.member_list = member_list
    },

    set_project(state, project) {

      // default here, in future for more advanced permissions thing may need to review
      // (but not actually project state itself, which is done below
      // therefore no race conditions)
      this.dispatch('reset_project_related_state')

      state.current = project

      // Key to handle this here since we may call
      // set project from different spots

      // TODO handle failure case ie no directory in list
      state.current_directory = project.directory_list[0]
    },
    set_current_directory_list(state, directory_list) {
      state.current.directory_list = directory_list
    },
    set_current_directory(state, directory) {
      state.current_directory = directory
    },
    patch_single_directory(state, directory) {
       state.current.last_patched_directory = directory
       state.current.directory_list.splice(0, 0, directory)
    }
  }
}

const org = {

  state: {
    current: {}
  },
  mutations: {
    clear_org(state) {
      state.current = {}
    },
    set_org(state, org) {
      state.current = org
    }
  }
}


/* Feb 14, 2020
 * Example context
 * of wanting to easily access values of counts from different
 * components and context that current media core is kind buried.
 *
 *
 */
const job = {

  state: {
    current: {}
  },
  mutations: {
    clear_job(state) {
      state.current = {}
    },
    set_job(state, job) {
      state.current = job
    }
  }
}

const integration_spec_list_template = [
  {
    'display_name': 'Google GCP',
    'name': 'google_gcp',
    'icon': 'mdi-google',
    'color': 'green'
  },
  {
    'display_name': 'Amazon AWS',
    'name': 'amazon_aws',
    'icon': 'mdi-aws',
    'color': 'orange'
  },
  {
    'display_name': 'Labelbox',
    'name': 'labelbox',
    'image-icon': 'https://media-exp1.licdn.com/dms/image/C560BAQFt9XQlXwgq4w/company-logo_200_200/0?e=2159024400&v=beta&t=ibcgfpz0onk3SrmDPcxj5BpfFav6zdOcwRVZZ36L0DI',
  },
  {
    'display_name': 'Datasaur',
    'name': 'datasaur',
    'image-icon': 'https://i.ibb.co/kSJhYfV/ridlcv2cdfip59eck8nt-removebg-preview.png',
  },
  {
    'display_name': 'Scale AI',
    'name': 'scale_ai',
    'image-icon': 'https://uploads-ssl.webflow.com/5f07389521600425ba513006/5f1750e39c67ad3dd7c69015_logo_scale.png',
  },
  {
    'display_name': 'Diffgram (Default)',
    'name': 'diffgram',
    'image-icon': 'https://res-4.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco/okhxici7vjqqznihxezz',
  },
  {'display_name': 'Microsoft Azure',
   'name': 'microsoft_azure',
   'icon': 'mdi-microsoft-azure',
   'color': 'blue'
  },
  // {'display_name': 'ScaleAI',
  //  'name': 'sacle_ai',
  //  'icon': 'mdi-domain',
  //  'color': 'purple'
  // }
]

export const connection = {

  state: {

    default: {},

    connection_list: [],

    integration_spec_list: integration_spec_list_template
  },
  mutations: {

    init_constant() {
      state.integration_spec_list = integration_spec_list_template
    },

    clear_connection(state) {
      state.default = {}
      state.connection_list = []
      state.integration_spec_list = integration_spec_list_template
    },
    set_default_connection(state, connection) {
      state.default = connection
    },
    set_connection_list(state, connection_list) {
      state.connection_list = connection_list
    }
  }
}

const input = {

  state: {
    list_refresh: null
  },
  mutations: {
    request_input_list_refresh: state => state.list_refresh = Date.now(),
  }
}


const media = {

  state: {
    refresh: null
  },
  mutations: {
    init_media_refresh: state => state.refresh = Date.now(),
  }
}


// TODO review namespace close to "actions"
const action = {

  state: {
    // TODO can the state and mutation name be the same?
    // may be good or bad ...
    refresh_list: null,
    refresh_event_list: null
  },
  mutations: {
    action_list_refresh: state => state.refresh_list = Date.now(),
    action_event_list_refresh: state => state.refresh_event_list = Date.now()
  }

}


const attribute = {

  state: {
    refresh_group_list: null
  },
  mutations: {
    attribute_refresh_group_list: state => state.refresh_group_list = Date.now()
  }

}


const error = {

  state: {
    permission: null
  },
  mutations: {
    error_permission: state => state.permission = Date.now(),
  }
}

const network = {

  state: {
    network_error: null
  },
  getters:{
    get_network_error: state => state.network_error,
  },
  mutations: {
    set_connection_error(state, error) {
      state.network_error =error;
    },
    clear_connection_error(state) {
      state.network_error = null;
    },
  }
}


const alert = {

  // TODO other components in here, ie info
  // move alert in here etc...

  state: {
    success: {},
    success_refresh: null
  },
  mutations: {
    success_message(state, success) {
      state.success_refresh = Date.now(),
        state.success = success
    },
    clear_alert(state) {
      state.success = {},
        state.success_refresh = null
    }
  }
}

const ai = {
  state: {
    links: {},
    ai_name: null,
    ai_string_id: null,

    refresh_ai_list: null
  },
  mutations: {
    set_ai_links(state, links) {
      state.links = links
    },
    set_ai_link_single(state, payload) {
      state.links[payload[0]] = payload[1]
    },
    set_ai_name(state, ai_name) {
      state.ai_name = ai_name
    },
    set_ai_string_id(state, ai_string_id) {
      state.ai_string_id = ai_string_id
    },
    clear_ai(state) {
      state.ai_name = null,
        state.ai_string_id = null
    },
    init_ai_list_refresh: state => state.refresh_ai_list = Date.now(),


  }
}


const annotation_state = {
  state: {
    mouse_down: false,
    edit: false,
    draw: false,
    get_instances: null,
    refresh_video_buffer: null,
    save: null,
    save_and_complete: null,
    instance_select_for_issue: false,
    instance_select_for_merge: false,
    view_issue_mode: false,

  },
  getters:{
    get_instance_select_for_issue: state => state.instance_select_for_issue,
    get_instance_select_for_merge: state => state.instance_select_for_merge,
    get_view_issue_mode: state => state.view_issue_mode
  },
  mutations: {
    mouse_state_down: state => state.mouse_down = true,
    mouse_state_up: state => state.mouse_down = false,
    init_edit: state => state.edit = true,
    finish_edit: state => state.edit = false,
    init_draw: state => state.draw = true,
    finish_draw: state => state.draw = false,
    set_instance_select_for_issue: (state, value) => state.instance_select_for_issue = value,
    set_instance_select_for_merge: (state, value) => state.instance_select_for_merge = value,
    set_view_issue_mode: (state, value) => state.view_issue_mode = value,

    clear_annotation(state) {
      state.mouse_down = false,
        state.edit = false,
        state.draw = false
    },
    get_instances: state => state.get_instances = Date.now(),
    refresh_video_buffer: state => state.refresh_video_buffer = Date.now(),
    save: state => state.save = Date.now(),
    save_and_complete: state => state.save_and_complete = Date.now(),
  },
}


const labels = {
  state: {
    refresh: false,
    sequence_refresh: null
  },
  mutations: {
    init_label_refresh: state => state.refresh = true,
    finish_label_refresh: state => state.refresh = false,

    sequence_refresh(state, time) {
      state.sequence_refresh = time
    },

    clear_labels(state) {
      state.refresh = false
    }
  }
}

const auth = {
  state: {
    members: {
      refresh: null
    }
  },
  mutations: {
    auth_members_refresh: state => state.members.refresh = Date.now()
  }
}


const annotation_assignment = {
  state: {
    assignment: {},
    on: false,
  },
  mutations: {
    annotation_assignment_on: state => state.on = true,
    annotation_assignment_off: state => state.on = false,
    set_annotation_assignment(state, assignment) {
      state.assignment = assignment
    },
    clear_annotation_assignment(state) {
      state.on = false,
        state.assignment = {}
    }
  }
}

const annotation_project = {
  state: {
    current: {}
  },
  mutations: {
    set_annotation_project(state, current) {
      state.current = current
    },
    clear_annotation_project(state) {
      state.current = {}
    }
  }
}

const builder_or_trainer = {
  state: {
    mode: null
  },
  getters:{
    get_current_mode: state => {
      return state.mode;
    }
  },
  mutations: {
    set_mode_trainer(state) {
      state.mode = "trainer"
    },
    set_mode_builder(state) {
      state.mode = "builder"
    },
    builder_or_trainer_toggle(state) {
      if (state.mode == "trainer") {
        state.mode = "builder"
      } else {
        state.mode = "trainer"
      }
    },
    builder_or_trainer_clear(state) {
      state.mode = null
    }
  }
}

const clipboard = {
  state: {
    clipboard_data: undefined,
  },
  getters:{
    get_clipboard: state => {
      return state.clipboard_data;
    }
  },
  mutations: {
    set_clipboard(state, data) {
      state.clipboard_data = data
    },
    clear_clipboard(state) {
      state.clipboard_data = undefined;
    }
  }
}

const video = {
  state: {
    current: {},
    go_to_keyframe_refresh: null,
    keyframe: null,
  },
  mutations: {
    set_video_current(state, current) {
      state.current = current
    },
    clear_video_current(state) {
      state.current = {}
    },
    go_to_keyframe_via_store(state, keyframe) {
      state.keyframe = keyframe
      state.go_to_keyframe_refresh = Date.now()
      /* trigger refresh, in case keyframe happens to be the same
          otherwise if say go to key frame 4 using this method
          then use different method to go to 5,
          then try to click back again, it will fail because it still
          has old number
       *
       */
    },
  }
}

const modulesToOmit = ['public_project', 'network']
const my_store = new Vuex.Store({
  modules: {
    attribute: attribute,
    action: action,
    org: org,
    alert: alert,
    error: error,
    network: network,
    builder_or_trainer: builder_or_trainer,
    auth: auth,
    user: user_module,
    media: media,
    annotation_state: annotation_state,
    project: project,
    ai: ai,
    labels: labels,
    annotation_assignment: annotation_assignment,
    annotation_project: annotation_project,
    video: video,
    job: job,
    connection: connection,
    input: input,
    clipboard: clipboard,
    public_project: public_project
  },
  plugins: [createPersistedState({

    reducer: (state) => {
      let reducer = Object.assign({}, state)
      for(const key of Object.keys(reducer)){
        if(modulesToOmit.includes(key)){
          delete reducer[key];
        }
      }

      return (reducer)
    }
  })]
})
if (window.Cypress) {
  window.__store__ = my_store
}

export default my_store
