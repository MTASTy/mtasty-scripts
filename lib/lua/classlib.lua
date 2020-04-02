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
        if __set[key] ~= nil then
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
    --	(Server) MTA10_Server\mods\deathmatch\logic\lua\CLuaMain.cpp
    --	(Client) MTA10\mods\shared_logic\lua\CLuaMain.cpp
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
