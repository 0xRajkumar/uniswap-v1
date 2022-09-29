/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface FactoryInterface extends utils.Interface {
  contractName: "Factory";
  functions: {
    "createExchange(address)": FunctionFragment;
    "getExchange(address)": FunctionFragment;
    "tokenToAddress(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "createExchange",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "getExchange", values: [string]): string;
  encodeFunctionData(
    functionFragment: "tokenToAddress",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "createExchange",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getExchange",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokenToAddress",
    data: BytesLike
  ): Result;

  events: {};
}

export interface Factory extends BaseContract {
  contractName: "Factory";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: FactoryInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    createExchange(
      _token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getExchange(_token: string, overrides?: CallOverrides): Promise<[string]>;

    tokenToAddress(arg0: string, overrides?: CallOverrides): Promise<[string]>;
  };

  createExchange(
    _token: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getExchange(_token: string, overrides?: CallOverrides): Promise<string>;

  tokenToAddress(arg0: string, overrides?: CallOverrides): Promise<string>;

  callStatic: {
    createExchange(_token: string, overrides?: CallOverrides): Promise<string>;

    getExchange(_token: string, overrides?: CallOverrides): Promise<string>;

    tokenToAddress(arg0: string, overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    createExchange(
      _token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getExchange(_token: string, overrides?: CallOverrides): Promise<BigNumber>;

    tokenToAddress(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    createExchange(
      _token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getExchange(
      _token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokenToAddress(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
