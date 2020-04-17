export const MTAHelpersScriptName = "____mta_helpers.lua";

// Language: Lua
export const MTAHelpersScriptContent = `\
____exports = {}
require = function(path)
    return ____exports["build/" .. string.gsub(path, "%.", "/") .. ".lua"]
end

_pcall, _xpcall = pcall, xpcall
coroutine._running = coroutine.running

local pack = table.pack or function(...) return {n = select("#", ...), ...} end
local unpack = table.unpack or unpack
local coromap = setmetatable({}, { __mode = "k" })

function handleReturnValue(err, co, status, ...)
    if not status then
        return false, err(debug.traceback(co, (...)), ...)
    end
    if coroutine.status(co) == 'suspended' then
        return performResume(err, co, coroutine.yield(...))
    else
        return true, ...
    end
end

function performResume(err, co, ...)
    return handleReturnValue(err, co, coroutine._resume(co, ...))
end

local function id(trace, ...)
    return trace
end

function xpcall(f, err, ...)
    local current = coroutine._running()
    if not current then
        if err == id then
            return _pcall(f, ...)
        else
            if select("#", ...) > 0 then
                local oldf, params = f, pack(...)
                f = function() return oldf(unpack(params, 1, params.n)) end
            end
            return _xpcall(f, err)
        end
    else
        local res, co = _pcall(coroutine.create, f)
        if not res then
            local newf = function(...) return f(...) end
            co = coroutine.create(newf)
        end
        coromap[co] = current
        return performResume(err, co, ...)
    end
end

function pcall(f, ...)
    return xpcall(f, id, ...)
end

function coroutine.running(co)
    if co ~= nil then
        assert(type(co)=="thread", "Bad argument; expected thread, got: " .. type(co))
    else
        co = coroutine._running()
    end
    while coromap[co] do
        co = coromap[co]
    end
    if co == "mainthread" then return nil end
    return co
end

local CLIENT = localPlayer ~= nil
local SERVER = not CLIENT

-- Magic to allow MTA elements to be used as data storage
-- e.g. localPlayer.foo = 12
local oop = {}
oop.elementInfo = setmetatable({}, { __mode = "k" })

oop.prepareClass = function(name)
    local mt = debug.getregistry().mt[name]

    if not mt then
        outputDebugString("No such class mt "..tostring(name))
        return
    end

    -- Store MTA's metafunctions
    local __mtaindex = mt.__index
    local __mtanewindex = mt.__newindex
    local __set = mt.__set

    mt.__index = function(self, key)
        if oop.elementInfo[self] and oop.elementInfo[self][key] ~= nil  then
            return oop.elementInfo[self][key]
        end

        return __mtaindex(self, key)
    end

    mt.__newindex = function(self, key, value)
        local hasIndex = __set[key] ~= nil
        if not hasIndex then
            local parentMT = mt.__parent
            while (parentMT and not hasIndex) do
                hasIndex = parentMT.__set[key] ~= nil
                parentMT = parentMT.__parent
            end
        end

        if hasIndex then
            __mtanewindex(self, key, value)
            return
        end

        if isElement(self) then
            if not oop.elementInfo[self] then
                oop.elementInfo[self] = {}

                addEventHandler(SERVER and "onElementDestroy" or "onClientElementDestroy", self,
                        function()
                            oop.elementInfo[self] = nil
                        end,
                        false, "low-999999"
                )
            end

            oop.elementInfo[self][key] = value
        end
    end
end

oop.initClasses = function()
    -- this has to match
    --\t(Server) MTA10_Server\\mods\\deathmatch\\logic\\lua\\CLuaMain.cpp
    --\t(Client) MTA10\\mods\\shared_logic\\lua\\CLuaMain.cpp
    if SERVER then
        oop.prepareClass("ACL")
        oop.prepareClass("ACLGroup")
        oop.prepareClass("Account")
        oop.prepareClass("Ban")
        oop.prepareClass("Connection")
        oop.prepareClass("QueryHandle")
        oop.prepareClass("TextDisplay")
        oop.prepareClass("TextItem")
    elseif CLIENT then
        oop.prepareClass("Browser")
        oop.prepareClass("Camera")
        oop.prepareClass("Light")
        oop.prepareClass("Projectile")
        oop.prepareClass("SearchLight")
        oop.prepareClass("Sound")
        oop.prepareClass("Sound3D")
        oop.prepareClass("Weapon")
        oop.prepareClass("Effect")
        oop.prepareClass("GuiElement")
        oop.prepareClass("GuiWindow")
        oop.prepareClass("GuiButton")
        oop.prepareClass("GuiEdit")
        oop.prepareClass("GuiLabel")
        oop.prepareClass("GuiMemo")
        oop.prepareClass("GuiStaticImage")
        oop.prepareClass("GuiComboBox")
        oop.prepareClass("GuiCheckBox")
        oop.prepareClass("GuiRadioButton")
        oop.prepareClass("GuiScrollPane")
        oop.prepareClass("GuiScrollBar")
        oop.prepareClass("GuiProgressBar")
        oop.prepareClass("GuiGridList")
        oop.prepareClass("GuiTabPanel")
        oop.prepareClass("GuiTab")
        oop.prepareClass("GuiFont")
        oop.prepareClass("GuiBrowser")
        oop.prepareClass("EngineCOL")
        oop.prepareClass("EngineTXD")
        oop.prepareClass("EngineDFF")
        oop.prepareClass("DxMaterial")
        oop.prepareClass("DxTexture")
        oop.prepareClass("DxFont")
        oop.prepareClass("DxShader")
        oop.prepareClass("DxScreenSource")
        oop.prepareClass("DxRenderTarget")
        oop.prepareClass("Weapon")
    end

    oop.prepareClass("Object")
    oop.prepareClass("Ped")
    oop.prepareClass("Pickup")
    oop.prepareClass("Player")
    oop.prepareClass("RadarArea")
    --oop.prepareClass("Vector2")
    --oop.prepareClass("Vector3")
    --oop.prepareClass("Vector4")
    --oop.prepareClass("Matrix")
    oop.prepareClass("Element")
    oop.prepareClass("Blip")
    oop.prepareClass("ColShape")
    oop.prepareClass("File")
    oop.prepareClass("Marker")
    oop.prepareClass("Vehicle")
    oop.prepareClass("Water")
    oop.prepareClass("XML")
    oop.prepareClass("Timer")
    oop.prepareClass("Team")
    oop.prepareClass("Resource")
end
oop.initClasses()
`;
