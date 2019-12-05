export const MTAHelpersScriptName = "____mta_helpers.lua";

// noinspection RemoveUnusedLocal
export const MTAHelpersScriptContent = `\
____exports = {}
require = function(path)
    return ____exports["build/" .. string.gsub(path, "%.", "/") .. ".lua"]
end

function debugMessageHandler(message, level, file, line)
    if (string.find(file, "____mta_helpers.lua")) then
        cancelEvent();
    end
end

if (localPlayer) then
  addEventHandler("onClientDebugMessage", root, debugMessageHandler)
else
  addEventHandler("onDebugMessage", root, debugMessageHandler)
end

local oldpcall, oldxpcall = pcall, xpcall
local pack = table.pack or function(...) return {n = select("#", ...), ...} end
local unpack = table.unpack or unpack
local running = coroutine.running
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
    return handleReturnValue(err, co, coroutine.resume(co, ...))
end

local function id(trace, ...)
    return trace
end

function coxpcall(f, err, ...)
    local current = running()
    if not current then
        if err == id then
            return oldpcall(f, ...)
        else
            if select("#", ...) > 0 then
                local oldf, params = f, pack(...)
                f = function() return oldf(unpack(params, 1, params.n)) end
            end
            return oldxpcall(f, err)
        end
    else
        local res, co = oldpcall(coroutine.create, f)
        if not res then
            local newf = function(...) return f(...) end
            co = coroutine.create(newf)
        end
        coromap[co] = current
        return performResume(err, co, ...)
    end
end

local function corunning(coro)
    if coro ~= nil then
        assert(type(coro)=="thread", "Bad argument; expected thread, got: "..type(coro))
    else
        coro = running()
    end
    while coromap[coro] do
        coro = coromap[coro]
    end
    if coro == "mainthread" then return nil end
    return coro
end

function copcall(f, ...)
    return coxpcall(f, id, ...)
end

pcall = copcall
xpcall = coxpcall
`;
