const customError = require('../utils/custom-error');
const authErrors = require('../errors/auth');
const config = require('../config');
const { Op } = require("sequelize");
const { handleSaveLog } = require('../handlers/log');
const Application = require('../models/model').Application;
const Access = require('../models/model').Access;
const Group = require('../models/model').Group;
const MapUserGroup = require('../models/model').MapUserGroup;
const Role = require('../models/model').Role;

const verifyAccessPermission = async (request) => {
    try {


        if (request.id) {
            var application = request.url.split('/')[2] //user/group/access/application
            var crud = request.url.split('/')[3] //all/allraw/mydata

            crud = crud.split('?')[0]

            var application_id = ''
            if (application == 'user') { application_id = config.user_role_id }
            else if (application == 'group') { application_id = config.group_role_id }
            else if (application == 'access') { application_id = config.access_role_id }
            else if (application == 'application') { application_id = config.access_role_id }
            else {

                return true
                // customError({
                //     message: 'Path not Match with permission',
                //     status: 'failed',
                //     statusCode: 403,
                //     data: 'Forbidden'
                // })
            }

            var application = await Application.findAll({
                include: { model: Access },
                where: { id: application_id }
            })


            var group = await MapUserGroup.findAll({
                include: { model: Group },
                where: { user_id: request.id }
            })
            // var group_id = group.map((el) => { return el.group_id })

            if (group.length == 0) {

                // if (!application[0].Access.rules.includes(group_id) && crud != 'mydata') {
                // if (!group_id.includes(application[0].Access.rules) && crud != 'mydata') {

                //     customError(authErrors.Forbidden)
                // }
                group_id = [config.quest_group_id]

            } else {
                group_id = await group.map((el) => { return el.group_id })
            }

            // var group_id_guest = config.quest_group_id
            var role = await Role.findAll({
                where: {
                    [Op.and]: [{ application_id: application_id }, { group_id: group_id }]
                }
            })
            // console.log('----------------------------------' + role)


            var check = {}
            if (role[0]) {
                check.create = role[0].create
                check.read = role[0].read
                check.update = role[0].update_
                check.delete = role[0].delete
            } else {
                check.create = 0
                check.read = 1
                check.update = 0
                check.delete = 0

            }

            if (['all', 'all_raw', 'byid'].includes(crud)) { if (check.read == 0) { customError(authErrors.Forbidden) } }
            else if (['put'].includes(crud)) {
                if (check.update == 0 && request.url.split('/')[4] != request.id) {
                    customError(authErrors.Forbidden)
                }
            }
            else if (['add'].includes(crud)) { if (check.create == 0) { customError(authErrors.Forbidden) } }
            else if (['delete'].includes(crud)) { if (check.delete == 0) { customError(authErrors.Forbidden) } }

        }
        return true
    } catch (error) {
        await handleSaveLog(request, [['verify permission'], 'Forbidden'])
        customError(authErrors.Forbidden)

    }
}

module.exports = {
    verifyAccessPermission
}